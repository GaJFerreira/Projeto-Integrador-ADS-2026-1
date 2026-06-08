import { Box, Typography, Paper, Container, Alert, Button, Card, CardContent, Stack, Chip, Badge, Avatar } from '@mui/material';
import '../components/carehub-accessibility.css';
import { CareHubModuleGrid } from '../components/CareHubModuleGrid';
import { Favorite, CheckCircle, Cancel, Star, RateReview, Home, Chat } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { initializeAuthToken, getUser, getUserRole, isCliente, getUserId, checkAndCacheUserType } from '../components/auth';
import http from '../libHttp';
import dayjs from 'dayjs';
import { agendamentosApi } from '../api';
import { listarContatos } from '../api/mensagens';
import { AvaliacaoModal } from '../components/AvaliacaoModal';
import { useNavigate } from 'react-router-dom';
import { parseDate } from '../utils/dateUtils';
import { useQuery } from '@tanstack/react-query';

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

  // Busca lista de contatos para pegar mensagens não lidas
  const { data: contatos = [] } = useQuery({
    queryKey: ['contatos', userId],
    queryFn: () => listarContatos(),
    enabled: !!userId,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const totalMensagensNaoLidas = contatos.reduce((acc, contato) => acc + (contato.mensagensNaoLidas || 0), 0);

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

  const formatarSeguro = (value?: string, pattern = 'DD/MM/YYYY HH:mm', fallback = 'Data não informada') => {
    const d = parseDate(value);
    return d ? dayjs(d).format(pattern) : fallback;
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          mb: { xs: 2.5, sm: 3, md: 4 },
          background: 'linear-gradient(135deg, #0d47a1 0%, #42a5f5 100%)',
          color: 'white',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 14px 32px rgba(13, 71, 161, 0.18)',
          border: '1px solid rgba(255,255,255,0.22)',
        }}
      >
        <Box sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 2.5, md: 4 }
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 1.75, sm: 2.25, md: 3 },
            minWidth: 0,
            flex: 1
          }}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.14)',
                borderRadius: 2,
                width: { xs: 58, sm: 68, md: 76 },
                height: { xs: 58, sm: 68, md: 76 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid rgba(255,255,255,0.28)',
                boxShadow: '0 10px 22px rgba(0,0,0,0.12)'
              }}
            >
              <Favorite sx={{ fontSize: { xs: 34, sm: 40, md: 46 }, color: '#ffb74d' }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Chip
                label="CareHub"
                size="small"
                sx={{
                  mb: 1,
                  height: 26,
                  borderRadius: 1,
                  color: '#0d47a1',
                  bgcolor: '#ffffff',
                  fontWeight: 800,
                  letterSpacing: 0,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  color: 'white',
                  fontSize: { xs: '1.55rem', sm: '2rem', md: '2.35rem' },
                  fontWeight: 800,
                  mb: 0.75,
                  wordBreak: 'break-word',
                  lineHeight: 1.15,
                  letterSpacing: 0
                }}
              >
                {userInfo ? `Olá, ${userInfo.name}!` : 'Bem-vindo ao CareHub'}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: '#e3f2fd',
                  fontWeight: 700,
                  fontSize: { xs: '0.98rem', sm: '1.12rem', md: '1.22rem' },
                  lineHeight: 1.35
                }}
              >
                Sistema de Acompanhamento de Idosos
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
                  lineHeight: 1.55,
                  mt: 1.25,
                  maxWidth: 720,
                }}
              >
                Conectando cuidadores profissionais e familias com cuidado, seguranca e dedicacao.
                Escolha o servico que voce precisa nas opcoes abaixo.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ width: { xs: '100%', md: 'auto' }, flexShrink: 0 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Home />}
              onClick={() => navigate('/home')}
              sx={{
                bgcolor: 'white',
                color: '#0d47a1',
                fontWeight: 800,
                fontSize: '0.95rem',
                borderRadius: 1,
                px: 3,
                py: 1.2,
                minWidth: { xs: '100%', sm: 230, md: 250 },
                '&:hover': {
                  bgcolor: '#e3f2fd',
                  transform: 'translateY(-1px)',
                },
                transition: 'transform 0.2s, background-color 0.2s',
                boxShadow: '0 10px 18px rgba(0,0,0,0.14)',
                textTransform: 'none'
              }}
            >
              Voltar para a pagina inicial
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Notificações de Mensagens Não Lidas */}
      {totalMensagensNaoLidas > 0 && (
        <Alert
          severity="info"
          icon={<Badge badgeContent={totalMensagensNaoLidas} color="error"><Chat /></Badge>}
          sx={{
            mb: { xs: 2, md: 3 },
            '& .MuiAlert-message': { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            border: '2px solid #2196f3',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.15rem' }, fontWeight: 'bold', color: '#0d47a1' }}>
              Novas mensagens
            </Typography>
            <Typography variant="body2" sx={{ color: '#1565c0' }}>
              Você tem {totalMensagensNaoLidas} mensagem(ns) não lida(s).
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/carehub/chat')}
            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#115293' }, whiteSpace: 'nowrap' }}
          >
            Abrir Chat
          </Button>
        </Alert>
      )}

      {/* Notificações de Repropostas de Data */}
      {repropostas.length > 0 && (
        <Alert
          severity="warning"
          sx={{
            mb: { xs: 2, md: 3 },
            borderRadius: 2,
            '& .MuiAlert-message': { width: '100%' },
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid rgba(217, 119, 6, 0.16)',
            boxShadow: '0 4px 20px rgba(217, 119, 6, 0.03)',
            '& .MuiAlert-icon': {
              alignItems: 'flex-start',
              color: '#d97706',
              fontSize: 26,
              mt: 0.5
            }
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontSize: { xs: '1rem', sm: '1.15rem' },
              fontWeight: 700,
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            📅 Você tem {repropostas.length} proposta(s) de nova data
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ color: '#78350f', mb: 2, display: { xs: 'none', sm: 'block' } }}>
            O cuidador propôs uma nova data. Revise e confirme abaixo:
          </Typography>

          <Stack spacing={2} sx={{ mt: 1.5 }}>
            {repropostas.map((ag) => (
              <Card
                key={ag.id}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid rgba(217, 119, 6, 0.08)',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(217, 119, 6, 0.05)',
                    borderColor: 'rgba(217, 119, 6, 0.22)',
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    gap={2.5}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                      <Avatar
                        sx={{
                          width: 42,
                          height: 42,
                          bgcolor: '#f0fdfa',
                          color: '#1565C0',
                          border: '1px solid rgba(15, 118, 110, 0.15)',
                          fontSize: '1rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        {ag.cuidadorNome?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            color: '#1e293b',
                            lineHeight: 1.3
                          }}
                        >
                          {ag.cuidadorNome}
                        </Typography>

                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={{ xs: 0.5, sm: 2 }} mt={0.5} flexWrap="wrap">
                          <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                            Original: <span style={{ textDecoration: 'line-through' }}>{formatarSeguro(ag.dataHoraInicio, 'DD/MM/YYYY [às] HH:mm')}</span>
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                            Nova proposta: <strong>{formatarSeguro(ag.proposedDataHoraInicio, 'DD/MM/YYYY [às] HH:mm')}</strong>
                          </Typography>
                        </Box>

                        {ag.tipoAtendimento && (
                          <Chip
                            label={ag.tipoAtendimento.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                            sx={{
                              mt: 1,
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#0f766e',
                              borderColor: 'rgba(15, 118, 110, 0.2)',
                              backgroundColor: '#f0fdfa'
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Stack direction="row" gap={1.25} sx={{ flexShrink: 0, justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}>
                      <Button
                        variant="contained"
                        size="medium"
                        startIcon={<CheckCircle />}
                        onClick={() => aceitarReproposta(ag.id)}
                        sx={{
                          fontSize: '0.825rem',
                          textTransform: 'none',
                          fontWeight: 700,
                          borderRadius: 2,
                          py: 0.8,
                          px: 2,
                          backgroundColor: '#16a34a',
                          boxShadow: '0 4px 10px rgba(22, 163, 74, 0.12)',
                          '&:hover': {
                            backgroundColor: '#15803d',
                            boxShadow: '0 6px 14px rgba(22, 163, 74, 0.2)'
                          }
                        }}
                      >
                        Confirmar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="medium"
                        startIcon={<Cancel />}
                        onClick={() => recusarReproposta(ag.id)}
                        sx={{
                          fontSize: '0.825rem',
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 2,
                          py: 0.8,
                          px: 2,
                          borderColor: '#fca5a5',
                          '&:hover': {
                            backgroundColor: '#fef2f2',
                            borderColor: '#ef4444'
                          }
                        }}
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

      {/* 🌟 Notificações de Avaliação Pendente */}
      {avaliacoesPendentes.length > 0 && (
        <Alert
          icon={
            <Badge
              badgeContent={avaliacoesPendentes.length}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  height: 18,
                  minWidth: 18,
                }
              }}
            >
              <RateReview sx={{ color: '#d97706', fontSize: 24 }} />
            </Badge>
          }
          sx={{
            mb: { xs: 2, md: 3 },
            borderRadius: 4,
            '& .MuiAlert-message': { width: '100%' },
            background: 'linear-gradient(135deg, #fffdf5 0%, #fef3c7 100%)',
            border: '1px solid rgba(217, 119, 6, 0.16)',
            boxShadow: '0 4px 20px rgba(217, 119, 6, 0.03)',
            '& .MuiAlert-icon': {
              alignItems: 'center'
            }
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontSize: { xs: '1rem', sm: '1.15rem' },
              fontWeight: 700,
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Star sx={{ color: '#f59e0b' }} />
            Como foi seu atendimento?
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ color: '#78350f', mb: 2 }}>
            Você tem {avaliacoesPendentes.length} atendimento(s) concluído(s) aguardando sua avaliação. Sua opinião ajuda outros clientes!
          </Typography>

          <Stack spacing={1.5} sx={{ mt: 1.5 }}>
            {avaliacoesPendentes.slice(0, 3).map((ag) => (
              <Card
                key={ag.id}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid rgba(217, 119, 6, 0.08)',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(217, 119, 6, 0.05)',
                    borderColor: 'rgba(217, 119, 6, 0.22)',
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    gap={2}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Avatar
                        sx={{
                          width: 42,
                          height: 42,
                          bgcolor: '#fffdf5',
                          color: '#d97706',
                          border: '1px solid rgba(217, 119, 6, 0.15)',
                          fontSize: '1rem',
                          fontWeight: 700
                        }}
                      >
                        {ag.cuidadorNome?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            color: '#1e293b',
                            lineHeight: 1.3
                          }}
                        >
                          {ag.cuidadorNome}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: { xs: '0.775rem', sm: '0.825rem' },
                            color: '#64748b',
                            mt: 0.25
                          }}
                        >
                          Concluído em {formatarSeguro(ag.dataHoraFim || ag.dataHoraInicio || ag.dataSolicitacao, 'DD/MM/YYYY [às] HH:mm')}
                        </Typography>
                        {ag.tipoAtendimento && (
                          <Chip
                            label={ag.tipoAtendimento.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                            sx={{
                              mt: 1,
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#d97706',
                              borderColor: 'rgba(217, 119, 6, 0.2)',
                              backgroundColor: '#fffdf5'
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<Star />}
                      onClick={() => abrirAvaliacaoModal(ag)}
                      sx={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        textTransform: 'none',
                        borderRadius: 2.5,
                        py: 1,
                        px: 2.5,
                        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                          boxShadow: '0 6px 16px rgba(217, 119, 6, 0.3)',
                          transform: 'translateY(-1px)'
                        },
                        '&:active': {
                          transform: 'translateY(0)'
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
