import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import http from '../libHttp';
import { initializeAuthToken } from '../components/auth';
import { useNavigate } from 'react-router-dom';

type PerfilResponse = {
  platformUserId?: number;
  role?: string;
  name?: string;
  email?: string;
  phone?: string;
  endereco?: string;
  necessidades?: string;
  contatoEmergencia?: string;
  experiencia?: string;
  cidade?: string;
  estado?: string;
  taxaHora?: number;
  especialidades?: string[];
};

export default function CareHubPrimeiroAcessoPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [novaEspecialidade, setNovaEspecialidade] = useState('');
  const [isCuidador, setIsCuidador] = useState(false);
  const [confirmKey, setConfirmKey] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    endereco: '',
    necessidades: '',
    contatoEmergencia: '',
    experiencia: '',
    cidade: '',
    estado: '',
    taxaHora: '',
    biografia: '',
    especialidades: [] as string[]
  });

  useEffect(() => {
    const carregar = async () => {
      await initializeAuthToken();
      try {
        const { data } = await http.get<PerfilResponse>('/api/carehub/perfil');
        const role = (data?.role || '').toUpperCase();
        const cuidador = role.includes('CUIDADOR');
        setIsCuidador(cuidador);

        const userStr = localStorage.getItem('user');
        const localUserId = userStr ? JSON.parse(userStr)?.userId : null;
        setConfirmKey(`carehub_profile_confirmed_${data?.platformUserId ?? localUserId ?? 'unknown'}`);

        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          endereco: data.endereco || '',
          necessidades: data.necessidades || '',
          contatoEmergencia: data.contatoEmergencia || '',
          experiencia: data.experiencia || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          taxaHora: data.taxaHora != null ? String(data.taxaHora) : '',
          biografia: '',
          especialidades: Array.isArray(data.especialidades) ? data.especialidades : []
        });
      } catch {
        setErro('Nao foi possivel carregar seu perfil. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [navigate]);

  const formValido = useMemo(() => {
    const base = form.name.trim().length > 1 && form.email.trim().length > 3 && form.phone.trim().length >= 8;
    if (!base) return false;

    if (!isCuidador) return true;

    return (
      form.experiencia.trim().length >= 3 &&
      form.cidade.trim().length >= 2 &&
      form.estado.trim().length === 2 &&
      Number(form.taxaHora) > 0 &&
      form.especialidades.length > 0
    );
  }, [form, isCuidador]);

  const addEspecialidade = () => {
    const esp = novaEspecialidade.trim();
    if (!esp) return;
    if (form.especialidades.some((e) => e.toLowerCase() === esp.toLowerCase())) {
      setNovaEspecialidade('');
      return;
    }
    setForm((prev) => ({ ...prev, especialidades: [...prev.especialidades, esp] }));
    setNovaEspecialidade('');
  };

  const removerEspecialidade = (esp: string) => {
    setForm((prev) => ({ ...prev, especialidades: prev.especialidades.filter((e) => e !== esp) }));
  };

  const salvar = async () => {
    if (!formValido) return;
    setErro(null);
    setSaving(true);
    try {
      await http.post('/api/carehub/perfil/completar', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        endereco: form.endereco.trim() || null,
        necessidades: form.necessidades.trim() || null,
        contatoEmergencia: form.contatoEmergencia.trim() || null,
        experiencia: form.experiencia.trim() || null,
        cidade: form.cidade.trim() || null,
        estado: form.estado.trim().toUpperCase() || null,
        taxaHora: form.taxaHora ? Number(form.taxaHora) : null,
        biografia: form.biografia.trim() || null,
        especialidades: form.especialidades
      });

      if (confirmKey) localStorage.setItem(confirmKey, 'true');
      navigate('/carehub', { replace: true });
    } catch {
      setErro('Nao foi possivel salvar seus dados. Revise as informacoes e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Carregando seu cadastro...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Confirmacao de dados do CareHub
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Primeiro acesso ao CareHub: confirme seus dados para continuar.
              </Typography>
            </Box>

            {erro && <Alert severity="error">{erro}</Alert>}

            <TextField label="Nome completo" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            <TextField label="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
            <TextField label="Telefone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />

            {!isCuidador && (
              <>
                <TextField label="Endereco (opcional)" value={form.endereco} onChange={(e) => setForm((p) => ({ ...p, endereco: e.target.value }))} />
                <TextField label="Necessidades (opcional)" value={form.necessidades} onChange={(e) => setForm((p) => ({ ...p, necessidades: e.target.value }))} multiline minRows={2} />
                <TextField label="Contato de emergencia (opcional)" value={form.contatoEmergencia} onChange={(e) => setForm((p) => ({ ...p, contatoEmergencia: e.target.value }))} />
              </>
            )}

            {isCuidador && (
              <>
                <TextField label="Cidade" value={form.cidade} onChange={(e) => setForm((p) => ({ ...p, cidade: e.target.value }))} required />
                <TextField label="UF (2 letras)" value={form.estado} onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value.slice(0, 2).toUpperCase() }))} required />
                <TextField label="Experiencia" value={form.experiencia} onChange={(e) => setForm((p) => ({ ...p, experiencia: e.target.value }))} required multiline minRows={2} />
                <TextField label="Valor por hora (R$)" type="number" value={form.taxaHora} onChange={(e) => setForm((p) => ({ ...p, taxaHora: e.target.value }))} required />
                <TextField label="Biografia (opcional)" value={form.biografia} onChange={(e) => setForm((p) => ({ ...p, biografia: e.target.value }))} multiline minRows={2} />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    fullWidth
                    label="Adicionar especialidade"
                    value={novaEspecialidade}
                    onChange={(e) => setNovaEspecialidade(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addEspecialidade();
                      }
                    }}
                  />
                  <Button variant="outlined" onClick={addEspecialidade}>Adicionar</Button>
                </Stack>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {form.especialidades.map((esp) => (
                    <Chip key={esp} label={esp} onDelete={() => removerEspecialidade(esp)} />
                  ))}
                </Stack>
              </>
            )}

            {!formValido && <Alert severity="info">Preencha os campos obrigatorios para concluir.</Alert>}

            <Button variant="contained" size="large" disabled={!formValido || saving} onClick={salvar}>
              {saving ? 'Salvando...' : 'Confirmar e entrar no CareHub'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
