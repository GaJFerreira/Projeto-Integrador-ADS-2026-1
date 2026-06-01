import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  CareHubHomePage,
  CuidadoresPage,
  AgendamentosPage,
  ProntuarioPage,
  AvaliacoesPage,
  ChatPage,
  MeusAgendamentosPage,
  ProntuariosClientesPage,
  RegistroAcompanhamentoPage,
  ProximosAtendimentosPage,
  HistoricoAtendimentosPage,
  CareHubPrimeiroAcessoPage,
  CareHubAjudaPage
} from '../index';
import http from '../libHttp';
import { initializeAuthToken } from '../components/auth';

type PerfilResponse = {
  platformUserId?: number;
  role?: string;
  name?: string;
  email?: string;
  phone?: string;
  experiencia?: string;
  cidade?: string;
  estado?: string;
  taxaHora?: number;
  especialidades?: string[];
};

function cuidadorIncompleto(perfil: PerfilResponse): boolean {
  const role = (perfil?.role || '').toUpperCase();
  if (!role.includes('CUIDADOR')) return false;

  return !(
    (perfil.phone || '').trim().length >= 8 &&
    (perfil.experiencia || '').trim().length >= 3 &&
    (perfil.cidade || '').trim().length >= 2 &&
    (perfil.estado || '').trim().length === 2 &&
    Number(perfil.taxaHora || 0) > 0 &&
    Array.isArray(perfil.especialidades) &&
    perfil.especialidades.length > 0
  );
}

function CareHubPerfilGate() {
  const location = useLocation();
  const [status, setStatus] = React.useState<'checking' | 'ok' | 'need-profile'>('checking');

  React.useEffect(() => {
    let mounted = true;

    const verificar = async () => {
      await initializeAuthToken();
      try {
        const { data } = await http.get<PerfilResponse>('/api/carehub/perfil');
        if (!mounted) return;

        const userStr = localStorage.getItem('user');
        const localUserId = userStr ? JSON.parse(userStr)?.userId : null;
        const confirmKey = `carehub_profile_confirmed_${data?.platformUserId ?? localUserId ?? 'unknown'}`;
        const confirmouPrimeiroAcesso = localStorage.getItem(confirmKey) === 'true';

        const precisaConfirmarPrimeiroAcesso = !confirmouPrimeiroAcesso;
        const precisaCompletarCuidador = cuidadorIncompleto(data);

        setStatus((precisaConfirmarPrimeiroAcesso || precisaCompletarCuidador) ? 'need-profile' : 'ok');
      } catch {
        if (!mounted) return;
        setStatus('ok');
      }
    };

    verificar();
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const isCompletarPage = location.pathname === '/carehub/completar-perfil';

  if (status === 'checking') return null;
  if (status === 'need-profile' && !isCompletarPage) {
    return <Navigate to="/carehub/completar-perfil" replace />;
  }
  if (status === 'ok' && isCompletarPage) {
    return <Navigate to="/carehub" replace />;
  }

  return <Outlet />;
}

export function CareHubRoutes() {
  return (
    <Routes>
      <Route element={<CareHubPerfilGate />}>
        <Route index element={<CareHubHomePage />} />
        <Route path="debug" element={<CareHubDebugPage />} />

        <Route path="proximos" element={<ProximosAtendimentosPage />} />
        <Route path="historico-atendimentos" element={<HistoricoAtendimentosPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="ajuda" element={<CareHubAjudaPage />} />

        <Route path="cuidadores" element={<CuidadoresPage />} />
        <Route path="agendamentos" element={<AgendamentosPage />} />
        <Route path="prontuario" element={<ProntuarioPage />} />
        <Route path="avaliacoes/:id" element={<AvaliacoesPage />} />

        <Route path="cuidador/agendamentos" element={<MeusAgendamentosPage />} />
        <Route path="cuidador/prontuarios" element={<ProntuariosClientesPage />} />
        <Route path="cuidador/registro" element={<RegistroAcompanhamentoPage />} />
        <Route path="cuidador/atendimentos" element={<ProximosAtendimentosPage />} />
      </Route>

      <Route path="completar-perfil" element={<CareHubPrimeiroAcessoPage />} />
      <Route path="*" element={<Navigate to="/carehub" replace />} />
    </Routes>
  );
}

function CareHubDebugPage() {
  const [tokenInput, setTokenInput] = React.useState('');
  const [debugInfo, setDebugInfo] = React.useState<any>(null);

  React.useEffect(() => {
    import('../components/auth').then(({ debugAuthStorage }) => {
      const info = debugAuthStorage();
      setDebugInfo(info);
    });
  }, []);

  const handleSetToken = () => {
    if (tokenInput.trim()) {
      import('../components/auth').then(({ setTokenManually }) => {
        setTokenManually(tokenInput.trim());
        alert('Token configurado! Volte para /carehub');
      });
    }
  };

  const handleAutoDetect = () => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('jwtToken') ||
      localStorage.getItem('authToken');

    if (token) {
      setTokenInput(token);
      alert('Token detectado automaticamente!');
    } else {
      alert('Nenhum token encontrado automaticamente.');
    }
  };

  return React.createElement(
    'div',
    {
      style: { padding: '20px', maxWidth: '800px', margin: '0 auto' }
    },
    [
      React.createElement('h1', { key: 'title' }, 'CareHub - Debug de Autenticacao'),
      React.createElement(
        'div',
        {
          key: 'storage-status',
          style: { marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }
        },
        [
          React.createElement('h3', { key: 'storage-title' }, 'Status do localStorage:'),
          debugInfo &&
            React.createElement('pre', { key: 'storage-data', style: { fontSize: '12px', backgroundColor: '#fff', padding: '10px', borderRadius: '4px' } }, JSON.stringify(debugInfo, null, 2))
        ]
      ),
      React.createElement(
        'div',
        {
          key: 'token-setup',
          style: { marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }
        },
        [
          React.createElement('h3', { key: 'token-title' }, 'Configurar Token Manualmente:'),
          React.createElement('p', { key: 'token-desc' }, 'Cole o token JWT aqui (voce pode encontra-lo no console de rede do navegador apos fazer login):'),
          React.createElement('textarea', {
            key: 'token-input',
            value: tokenInput,
            onChange: (e: any) => setTokenInput(e.target.value),
            placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            style: { width: '100%', height: '100px', marginBottom: '10px' }
          }),
          React.createElement('button', { key: 'set-token-btn', onClick: handleSetToken, style: { marginRight: '10px', padding: '8px 16px' } }, 'Configurar Token'),
          React.createElement('button', { key: 'auto-detect-btn', onClick: handleAutoDetect, style: { padding: '8px 16px' } }, 'Detectar Automaticamente')
        ]
      )
    ]
  );
}
