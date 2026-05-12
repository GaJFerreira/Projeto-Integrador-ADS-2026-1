import { Box, Typography, Paper, Container, Alert, Button, Card, CardContent, Stack, Chip, Badge } from '@mui/material';
import '../components/carehub-accessibility.css';
import { CareHubModuleGrid } from '../components/CareHubModuleGrid';
import { Favorite, CheckCircle, Cancel, Star, RateReview, Home } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { initializeAuthToken, getUser, getUserRole, isCliente, getUserId, checkAndCacheUserType } from '../components/auth';
import http from '../libHttp';
import dayjs from 'dayjs';
import { agendamentosApi } from '../api';
import { AvaliacaoModal } from '../components/AvaliacaoModal';
import { useNavigate } from 'react-router-dom';

export default function CareHubHomePage() {
  const navigate = useNavigate();
  const [_authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [repropostas, setRepropostas] = useState<any[]>([]);
  const [isUserCliente, setIsUserCliente] = useState<boolean>(false);
  const [avaliacoesPendentes, setAvaliacoesPendentes] = useState<any[]>([]);
  const [avaliacaoModalOpen, setAvaliacaoModalOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Inicializar token JWT no interceptor quando o CareHub for carregado
    initializeAuthToken();

    const inicializar = async () => {
      // Verificar tipo de usuário (cuidador/cliente) via API
      await checkAndCacheUserType();
      const ehCliente = isCliente();
      setIsUserCliente(ehCliente);

      // Obter userId após inicialização
      const currentUserId = getUserId();
      setUserId(currentUserId);

      // Verificar status da autenticação
      const user = getUser();
      const role = getUserRole();

      if (user && role) {
        setAuthStatus('authenticated');
        setUserInfo({ ...user, role });
      } else {
        setAuthStatus('unauthenticated');
      }
    };

    inicializar();
  }, []);

  // Carregar dados quando userId e tipo de usuário estiverem disponíveis
  useEffect(() => {
    if (userId && isUserCliente) {
      carregarRepropostas();
      carregarAvaliacoesPendentes();
    }
  }, [userId, isUserCliente]);

  const carregarAvaliacoesPendentes = async () => {
    try {
      const pendentes = await agendamentosApi.avaliacoesPendentes();
      // Garante que sempre seja array, mesmo se a API retornar objeto paginado
      const lista = Array.isArray(pendentes) ? pendentes : (pendentes as any)?.content ?? [];
      setAvaliacoesPendentes(lista);
    } catch {
      setAvaliacoesPendentes([]);
    }
  };

  const abrirAvaliacaoModal = (agendamento: any) => {
    setSelectedAgendamento(agendamento);
    setAvaliacaoModalOpen(true);
  };

  const fecharAvaliacaoModal = () => {
    setAvaliacaoModalOpen(false);
    setSelectedAgendamento(null);
    // Recarregar lista de avaliações pendentes após fechar modal
    carregarAvaliacoesPendentes();
  };

  const carregarRepropostas = async () => {
    try {
      const response = await http.get(`/api/carehub/agendamentos/cliente/${userId}`);
      const agendamentosReagendados = (Array.isArray(response.data) ? response.data : (response.data as any)?.content ?? []).filter(
        (ag: any) => ag.status === 'REAGENDADO' && ag.proposedDataHoraInicio
      );
      setRepropostas(agendamentosReagendados);
    } catch {
      // Silenciosamente ignora erro - usuário pode não ter agendamentos ou não ser cliente cadastrado
      setRepropostas([]);
    }
  };

  const aceitarReproposta = async (agendamentoId: number) => {
    try {
      await http.post(`/api/carehub/agendamentos/${agendamentoId}/aceitar-contraproposta`);
      alert('Nova data confirmada com sucesso!');
      carregarRepropostas();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Erro ao aceitar nova data');
    }
  };

  const recusarReproposta = async (agendamentoId: number) => {
    try {
      await http.put(`/api/carehub/agendamentos/${agendamentoId}/status?status=CANCELADO`);
      alert('Agendamento cancelado.');
      carregarRepropostas();
    } catch (error) {
      alert('Erro ao recusar reproposta');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 4, md: 6 },
          mb: { xs: 3, sm: 4, md: 5 },
          background: 'linear-gradient(135deg, #0d47a1 0%, #42a5f5 100%)',
          color: 'white',
          borderRadius: { xs: 3, sm: 4, md: 5 },
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(13, 71, 161, 0.25)'
        }}
      >
        {/* Soft background circles for modern look */}
        <Box
          sx={{
            position: 'absolute',
            top: -120,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
            display: { xs: 'none', sm: 'block' },
            pointerEvents: 'none'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            display: { xs: 'none', sm: 'block' },
            pointerEvents: 'none'
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2.5, sm: 3, md: 4 }
          }}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: '50%',
                p: { xs: 2, md: 3 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                flexShrink: 0,
                border: '4px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }}
            >
              <Favorite sx={{ fontSize: { xs: 48, sm: 56, md: 72 }, color: '#ffb74d', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
            </Box>
            <Box sx={{ minWidth: 0, width: '100%' }}>
              <Typography
                variant="h1"
                sx={{
                  color: 'white',
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem', lg: '3.5rem' },
                  fontWeight: 800,
                  mb: 1,
                  textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  wordBreak: 'break-word',
                  lineHeight: 1.2
                }}
              >
                {userInfo ? `Olá, ${userInfo.name}!` : 'Bem-vindo ao CareHub'}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: '#e3f2fd',
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                  textShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}
              >
                Sistema de Acompanhamento de Idosos
              </Typography>
            </Box>
          </Box>

          <Paper
            elevation={0}
            sx={{
              bgcolor: 'rgba(0, 0, 0, 0.15)',
              borderRadius: 3,
              p: { xs: 2, sm: 3 },
              backdropFilter: 'blur(5px)',
              maxWidth: '800px',
              borderLeft: '4px solid #ffb74d'
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.95)',
                fontSize: { xs: '1.05rem', sm: '1.15rem', md: '1.25rem' },
                lineHeight: 1.6,
                fontWeight: 500
              }}
            >
              Conectando cuidadores profissionais e famílias com cuidado, segurança e dedicação.
              Escolha o serviço que você precisa nas opções abaixo.
            </Typography>
          </Paper>

          <Box sx={{ mt: 1 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Home />}
              onClick={() => navigate('/home')}
              sx={{
                bgcolor: 'white',
                color: '#0d47a1',
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 8,
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: '#e3f2fd',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
              }}
            >
              Voltar para a Página Inicial
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Notificações de Repropostas de Data */}
      {repropostas.length > 0 && (
        <Alert severity="warning" sx={{ mb: { xs: 2, md: 3 }, '& .MuiAlert-message': { width: '100%' } }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } }}>
            📅 Você tem {repropostas.length} proposta(s) de nova data
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ display: { xs: 'none', sm: 'block' } }}>
            O cuidador propôs uma nova data. Revise e confirme abaixo:
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            {repropostas.map((ag) => (
              <Card key={ag.id} variant="outlined">
                <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                    gap={2}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        Cuidador: {ag.cuidadorNome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Original: {dayjs(ag.dataHoraInicio).format('DD/MM HH:mm')}
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="primary" sx={{ mt: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        Nova: {dayjs(ag.proposedDataHoraInicio).format('DD/MM HH:mm')}
                      </Typography>
                      {ag.tipoAtendimento && (
                        <Chip label={ag.tipoAtendimento} size="small" sx={{ mt: 1 }} />
                      )}
                    </Box>

                    <Stack direction="row" gap={1} sx={{ flexShrink: 0, justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => aceitarReproposta(ag.id)}
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
                      >
                        Confirmar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Cancel />}
                        onClick={() => recusarReproposta(ag.id)}
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
                      >
                        Recusar
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Alert>
      )}

      {/* 🌟 Notificações de Avaliação Pendente - Estilo Uber/99 */}
      {avaliacoesPendentes.length > 0 && (
        <Alert
          severity="info"
          icon={<Badge badgeContent={avaliacoesPendentes.length} color="error"><RateReview /></Badge>}
          sx={{
            mb: { xs: 2, md: 3 },
            '& .MuiAlert-message': { width: '100%' },
            background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
            border: '2px solid #ffc107',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star sx={{ color: '#ffc107' }} />
            Como foi seu atendimento?
          </Typography>
          <Typography variant="body2" gutterBottom color="text.secondary">
            Você tem {avaliacoesPendentes.length} atendimento(s) concluído(s) aguardando sua avaliação. Sua opinião ajuda outros clientes!
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            {avaliacoesPendentes.slice(0, 3).map((ag) => (
              <Card
                key={ag.id}
                variant="outlined"
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 3,
                    borderColor: '#ffc107',
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    gap={2}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        {ag.cuidadorNome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Concluído em {dayjs(ag.dataHoraFim).format('DD/MM/YYYY [às] HH:mm')}
                      </Typography>
                      {ag.tipoAtendimento && (
                        <Chip
                          label={ag.tipoAtendimento.replace('_', ' ')}
                          size="small"
                          sx={{ mt: 1 }}
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<Star />}
                      onClick={() => abrirAvaliacaoModal(ag)}
                      sx={{
                        background: 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)',
                        color: '#000',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #ffb300 0%, #ffa000 100%)',
                        },
                        minWidth: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Avaliar agora
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            {avaliacoesPendentes.length > 3 && (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                + {avaliacoesPendentes.length - 3} mais avaliação(ões) pendente(s)
              </Typography>
            )}
          </Stack>
        </Alert>
      )}

      <CareHubModuleGrid />

      {/* Modal de Avaliação */}
      {selectedAgendamento && (
        <AvaliacaoModal
          open={avaliacaoModalOpen}
          onClose={fecharAvaliacaoModal}
          cuidadorId={selectedAgendamento.cuidadorId}
          cuidadorNome={selectedAgendamento.cuidadorNome}
          clienteId={userId || 0}
          initialAgendamentoId={selectedAgendamento.id}
        />
      )}
    </Container>
  );
}
