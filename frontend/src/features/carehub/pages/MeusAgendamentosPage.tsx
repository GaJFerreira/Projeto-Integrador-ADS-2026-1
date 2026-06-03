import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogContent,
  DialogActions,
  Zoom,
  IconButton,
} from '@mui/material';
import { AvaliacaoModal } from '../components/AvaliacaoModal';
import { RepropostaDataModal } from '../components/RepropostaDataModal';
import {
  CalendarToday,
  AccessTime,
  Person,
  CheckCircle,
  CheckBox,
  Cancel,
  HourglassEmpty,
  Forum,
  Close,
} from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import { getUserId, isCuidador, checkAndCacheUserType } from '../components/auth';
import http from '../libHttp';
import { parseDate } from '../utils/dateUtils';

interface Agendamento {
  id: number;
  clienteNome: string;
  clienteId?: number;
  cuidadorId?: number;
  cuidadorNome?: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: string;
  observacoes?: string;
  tipoAtendimento?: string;
}

interface ValidacaoInicio {
  podeIniciar: boolean;
  motivo?: string;
  inicioPermitido?: string;
}

const TIPOS_ATENDIMENTO: Record<string, string> = {
  'DOMICILIO': 'Atendimento Domiciliar',
  'ACOMPANHAMENTO': 'Acompanhamento',
  'PRESENCIAL': 'Atendimento Presencial',
  'EMERGENCIA': 'Emergência',
};

export function MeusAgendamentosPage() {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validacoes, setValidacoes] = useState<Record<number, ValidacaoInicio>>({});
  const [tabAtual, setTabAtual] = useState(0);

  // ID do usuário logado e papel - usar state para garantir reatividade
  const [userId, setUserId] = useState<number | null>(null);
  const [isUserCuidador, setIsUserCuidador] = useState<boolean>(false);

  const [avaliacaoModalOpen, setAvaliacoesModalOpen] = useState(false);
  const [avaliacaoCuidadorId, setAvaliacaoCuidadorId] = useState<number | null>(null);
  const [avaliacaoCuidadorNome, setAvaliacaoCuidadorNome] = useState<string | undefined>(undefined);
  const [avaliacaoAgendamentoId, setAvaliacaoAgendamentoId] = useState<number | null>(null);

  const [repropostaModalOpen, setRepropostaModalOpen] = useState(false);
  const [agendamentoReproposta, setAgendamentoReproposta] = useState<Agendamento | null>(null);
  const [chatConfirmOpen, setChatConfirmOpen] = useState(false);

  useEffect(() => {
    const inicializar = async () => {
      await checkAndCacheUserType();
      setIsUserCuidador(isCuidador());
      const currentUserId = getUserId();
      setUserId(currentUserId);
    };
    inicializar();
  }, []);

  // Carregar agendamentos quando userId estiver disponível
  useEffect(() => {
    if (userId) {
      carregarAgendamentos();
    }
  }, [userId]);

  const carregarAgendamentos = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await http.get(`/api/carehub/agendamentos/cuidador/${userId}`);
      const _arr = Array.isArray(response.data) ? response.data : (response.data as any)?.content ?? [];
      setAgendamentos(_arr);

      // Verificar quais agendamentos CONFIRMADOS podem ser iniciados
      const validacoesTemp: Record<number, ValidacaoInicio> = {};
      for (const ag of _arr) {
        if (ag.status === 'CONFIRMADO') {
          try {
            const valResp = await http.get(`/api/carehub/agendamentos/${ag.id}/pode-iniciar`);
            validacoesTemp[ag.id] = {
              podeIniciar: valResp.data.podeIniciar,
              motivo: valResp.data.motivo,
              inicioPermitido: valResp.data.inicioPermitido,
            };
          } catch (err) {
            validacoesTemp[ag.id] = { podeIniciar: false, motivo: 'Erro ao validar' };
          }
        }
      }
      setValidacoes(validacoesTemp);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
      setError('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (agendamentoId: number, novoStatus: string) => {
    try {
      // Se for finalizar, verificar se existe registro de acompanhamento
      if (novoStatus === 'CONCLUIDO') {
        try {
          const registroResp = await http.get(`/api/carehub/registros/agendamento/${agendamentoId}`);
          const registros = registroResp.data;

          if (!registros || registros.length === 0) {
            alert('❌ Nenhum registro de acompanhamento encontrado!\n\n' +
              'Preencha o registro antes de finalizar o atendimento.');
            navigate(`/carehub/cuidador/registro?agendamentoId=${agendamentoId}`);
            return;
          }
          // Registro existe — pode prosseguir com a conclusão
        } catch (err: any) {
          alert('❌ Erro ao verificar registro de acompanhamento!\n\n' +
            'Preencha o registro antes de finalizar o atendimento.');
          navigate(`/carehub/cuidador/registro?agendamentoId=${agendamentoId}`);
          return;
        }
      }

      await http.put(
        `/api/carehub/agendamentos/${agendamentoId}/status?status=${novoStatus}`
      );

      // ✅ Se iniciou o atendimento, redireciona para registro de acompanhamento
      if (novoStatus === 'EM_ANDAMENTO') {
        navigate(`/carehub/cuidador/registro?agendamentoId=${agendamentoId}`);
      } else if (novoStatus === 'CONCLUIDO' && isUserCuidador) {
        // Cuidador finalizou - recarregar lista e mostrar sucesso
        alert('✅ Atendimento finalizado com sucesso!\n\nO cliente poderá avaliar o atendimento agora.');
        carregarAgendamentos();
      } else if (novoStatus === 'CONFIRMADO' && isUserCuidador) {
        carregarAgendamentos();
        setChatConfirmOpen(true);
      } else {
        carregarAgendamentos(); // Recarrega a lista para outros status
      }
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err);

      // Se for erro de validação de horário, mostrar mensagem específica
      if (err.response?.status === 403 && err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('Erro ao atualizar status do agendamento');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'warning'; // Aguardando confirmação do cuidador
      case 'CONFIRMADO':
        return 'success'; // Cuidador confirmou
      case 'EM_ANDAMENTO':
        return 'info'; // Atendimento em andamento
      case 'CONCLUIDO':
        return 'primary'; // Finalizado
      case 'CANCELADO':
        return 'error'; // Cancelado
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return <HourglassEmpty />; // Aguardando
      case 'CONFIRMADO':
        return <CheckCircle />; // Confirmado
      case 'EM_ANDAMENTO':
        return <AccessTime />; // Em andamento
      case 'CONCLUIDO':
        return <CheckBox />; // Concluído
      case 'CANCELADO':
        return <Cancel />; // Cancelado
      default:
        return <CalendarToday />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'Aguardando Confirmação';
      case 'CONFIRMADO':
        return 'Confirmado';
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      case 'CONCLUIDO':
        return 'Concluído';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return {
          color: '#b45309', // amber escuro
          backgroundColor: '#fef3c7', // amber suave
          borderColor: '#fcd34d',
        };
      case 'CONFIRMADO':
        return {
          color: '#0f766e', // teal escuro
          backgroundColor: '#f0fdfa', // teal suave
          borderColor: '#99f6e4',
        };
      case 'EM_ANDAMENTO':
        return {
          color: '#1d4ed8', // blue escuro
          backgroundColor: '#eff6ff', // blue suave
          borderColor: '#bfdbfe',
        };
      case 'CONCLUIDO':
        return {
          color: '#15803d', // green escuro
          backgroundColor: '#f0fdf4', // green suave
          borderColor: '#bbf7d0',
        };
      case 'CANCELADO':
        return {
          color: '#b91c1c', // red escuro
          backgroundColor: '#fef2f2', // red suave
          borderColor: '#fecaca',
        };
      default:
        return {
          color: '#475569',
          backgroundColor: '#f1f5f9',
          borderColor: '#e2e8f0',
        };
    }
  };

  const formatarData = (dataISO: string) => {
    const data = parseDate(dataISO);
    if (!data) return '-';
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    // Resetar horas para comparação apenas de datas
    hoje.setHours(0, 0, 0, 0);
    amanha.setHours(0, 0, 0, 0);
    const dataComparacao = new Date(data);
    dataComparacao.setHours(0, 0, 0, 0);

    if (dataComparacao.getTime() === hoje.getTime()) {
      return 'Hoje';
    } else if (dataComparacao.getTime() === amanha.getTime()) {
      return 'Amanhã';
    }

    return data.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarHorarioAtendimento = (inicio: string, fim: string) => {
    const dataInicio = parseDate(inicio);
    const dataFim = parseDate(fim);
    if (!dataInicio || !dataFim) return '-';

    const horaInicio = dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const horaFim = dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const duracao = Math.round((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60)); // minutos
    const horas = Math.floor(duracao / 60);
    const minutos = duracao % 60;

    let duracaoTexto = '';
    if (horas > 0) {
      duracaoTexto = `${horas}h`;
      if (minutos > 0) duracaoTexto += ` ${minutos}min`;
    } else {
      duracaoTexto = `${minutos}min`;
    }

    return `${horaInicio} - ${horaFim} (${duracaoTexto})`;
  };

  // Filtrar agendamentos por categoria
  const agendamentosPendentes = agendamentos.filter(a => a.status === 'PENDENTE');
  const agendamentosConfirmados = agendamentos.filter(a => a.status === 'CONFIRMADO');
  const agendamentosEmAndamento = agendamentos.filter(a => a.status === 'EM_ANDAMENTO');
  const agendamentosFinalizados = agendamentos.filter(a =>
    a.status === 'CONCLUIDO' || a.status === 'CANCELADO'
  );

  const categorias = [
    { label: 'Pendentes', count: agendamentosPendentes.length, agendamentos: agendamentosPendentes },
    { label: 'Confirmados', count: agendamentosConfirmados.length, agendamentos: agendamentosConfirmados },
    { label: 'Em Andamento', count: agendamentosEmAndamento.length, agendamentos: agendamentosEmAndamento },
    { label: 'Finalizados', count: agendamentosFinalizados.length, agendamentos: agendamentosFinalizados },
  ];

  const agendamentosFiltrados = categorias[tabAtual].agendamentos;

  if (loading) {
    return (
      <Box>
        <PageHeader title="Meus Agendamentos" backTo="/carehub/agendamentos-menu" />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Meus Agendamentos" backTo="/carehub/agendamentos-menu" />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Abas de Filtro */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabAtual}
          onChange={(_, newValue) => setTabAtual(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categorias.map((cat, index) => (
            <Tab
              key={index}
              label={
                <Badge badgeContent={cat.count} color="primary">
                  <Box sx={{ px: 1 }}>{cat.label}</Box>
                </Badge>
              }
            />
          ))}
        </Tabs>
      </Box>

      {agendamentosFiltrados.length === 0 ? (
        <Alert severity="info">
          {tabAtual === 0 && 'Nenhum agendamento pendente de confirmação.'}
          {tabAtual === 1 && 'Nenhum agendamento confirmado no momento.'}
          {tabAtual === 2 && 'Nenhum atendimento em andamento.'}
          {tabAtual === 3 && 'Nenhum agendamento finalizado.'}
        </Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {agendamentosFiltrados.map((agendamento) => (
            <Card
              key={agendamento.id}
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                border: '1px solid rgba(15, 118, 110, 0.09)',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 30px rgba(15, 118, 110, 0.08)',
                  borderColor: 'rgba(15, 118, 110, 0.22)',
                },
              }}
            >
              <CardContent sx={{ p: 3, pb: 2.5, flexGrow: 1 }}>
                {/* Status */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Chip
                    icon={getStatusIcon(agendamento.status)}
                    label={getStatusLabel(agendamento.status)}
                    variant="outlined"
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      height: 26,
                      borderRadius: 1.5,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      px: 0.5,
                      '& .MuiChip-icon': { 
                        color: 'inherit',
                        fontSize: '1rem',
                        marginLeft: '4px',
                        marginRight: '-4px'
                      },
                      ...getStatusStyles(agendamento.status)
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    fontWeight={600}
                    sx={{ 
                      color: '#94a3b8',
                      backgroundColor: '#f8fafc',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    ID: {agendamento.id}
                  </Typography>
                </Box>

                {/* Cliente */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      backgroundColor: '#f0fdfa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0f766e',
                      border: '1px solid rgba(15, 118, 110, 0.12)',
                    }}
                  >
                    <Person sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography 
                      variant="caption" 
                      fontWeight={600} 
                      sx={{ color: '#94a3b8', display: 'block', lineHeight: 1.2 }}
                    >
                      Cliente
                    </Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight={700} 
                      sx={{ color: '#1e293b', fontSize: '1rem', mt: 0.25 }}
                    >
                      {agendamento.clienteNome}
                    </Typography>
                  </Box>
                </Box>

                {/* Data e Hora */}
                <Box
                  sx={{
                    backgroundColor: '#f8fafc',
                    borderRadius: 3,
                    p: 2,
                    mb: 2.5,
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <Stack spacing={1.25}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <CalendarToday sx={{ fontSize: 16, color: '#0f766e' }} aria-label="Ícone de calendário" />
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#334155' }}>
                        {formatarData(agendamento.dataHoraInicio)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <AccessTime sx={{ fontSize: 16, color: '#64748b' }} aria-label="Ícone de relógio" />
                      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                        {formatarHorarioAtendimento(agendamento.dataHoraInicio, agendamento.dataHoraFim)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Tipo de Atendimento */}
                {agendamento.tipoAtendimento && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 1.5, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.75,
                      color: '#64748b',
                      fontSize: '0.875rem' 
                    }}
                  >
                    <span>Tipo:</span>
                    <strong style={{ color: '#334155', fontWeight: 600 }}>
                      {TIPOS_ATENDIMENTO[agendamento.tipoAtendimento] || agendamento.tipoAtendimento}
                    </strong>
                  </Typography>
                )}

                {/* Observações */}
                {agendamento.observacoes && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      backgroundColor: '#fffdf5',
                      borderLeft: '3px solid #f59e0b',
                      borderRadius: '0 8px 8px 0',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontStyle: 'italic', 
                        fontSize: '0.825rem',
                        color: '#d97706',
                        lineHeight: 1.4
                      }}
                    >
                      "{agendamento.observacoes}"
                    </Typography>
                  </Box>
                )}
              </CardContent>

              {/* Ações */}
              {agendamento.status === 'PENDENTE' && (
                <Box sx={{ p: 3, pt: 0 }}>
                  <Stack spacing={1.25}>
                    {isUserCuidador ? (
                      <>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => atualizarStatus(agendamento.id, 'CONFIRMADO')}
                          sx={{
                            borderRadius: 2.5,
                            py: 1.15,
                            fontWeight: 700,
                            textTransform: 'none',
                            backgroundColor: '#0f766e',
                            boxShadow: '0 4px 12px rgba(15, 118, 110, 0.15)',
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: '#0d625b',
                              boxShadow: '0 6px 16px rgba(15, 118, 110, 0.25)',
                              transform: 'translateY(-1px)'
                            },
                            '&:active': {
                              transform: 'translateY(0)'
                            }
                          }}
                        >
                          ✓ Confirmar Disponibilidade
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => {
                            setAgendamentoReproposta(agendamento);
                            setRepropostaModalOpen(true);
                          }}
                          sx={{
                            borderRadius: 2.5,
                            py: 1,
                            fontWeight: 600,
                            textTransform: 'none',
                            color: '#d97706',
                            borderColor: '#f59e0b',
                            '&:hover': {
                              borderColor: '#d97706',
                              backgroundColor: '#fffbeb'
                            }
                          }}
                        >
                          📅 Propor Outro Horário
                        </Button>
                        <Button
                          fullWidth
                          variant="text"
                          onClick={() => atualizarStatus(agendamento.id, 'CANCELADO')}
                          sx={{
                            borderRadius: 2.5,
                            py: 0.75,
                            fontWeight: 500,
                            textTransform: 'none',
                            color: '#dc2626',
                            fontSize: '0.85rem',
                            '&:hover': {
                              backgroundColor: '#fef2f2'
                            }
                          }}
                        >
                          ✕ Recusar Proposta
                        </Button>
                      </>
                    ) : (
                      <>
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          Aguardando confirmação do cuidador.
                        </Alert>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => atualizarStatus(agendamento.id, 'CANCELADO')}
                          sx={{
                            borderRadius: 2.5,
                            py: 1,
                            fontWeight: 600,
                            textTransform: 'none',
                            color: '#dc2626',
                            borderColor: '#fca5a5',
                            '&:hover': {
                              borderColor: '#dc2626',
                              backgroundColor: '#fef2f2'
                            }
                          }}
                        >
                          Cancelar Solicitação
                        </Button>
                      </>
                    )}
                  </Stack>
                </Box>
              )}

              {agendamento.status === 'CONFIRMADO' && (
                <Box sx={{ p: 3, pt: 0 }}>
                  <Stack spacing={1.5}>
                    {validacoes[agendamento.id] && !validacoes[agendamento.id].podeIniciar && (
                      <Alert severity="info" sx={{ fontSize: '0.825rem', borderRadius: 2 }}>
                        <strong>Aguarde:</strong> {validacoes[agendamento.id].motivo}
                      </Alert>
                    )}
                    {validacoes[agendamento.id]?.podeIniciar && (
                      <Alert severity="success" sx={{ fontSize: '0.825rem', borderRadius: 2 }}>
                        ✓ Você pode iniciar o atendimento agora!
                      </Alert>
                    )}
                    {isUserCuidador ? (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => atualizarStatus(agendamento.id, 'EM_ANDAMENTO')}
                        disabled={validacoes[agendamento.id] && !validacoes[agendamento.id].podeIniciar}
                        sx={{
                          borderRadius: 2.5,
                          py: 1.15,
                          fontWeight: 700,
                          textTransform: 'none',
                          backgroundColor: '#0f766e',
                          boxShadow: '0 4px 12px rgba(15, 118, 110, 0.15)',
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: '#0d625b',
                            boxShadow: '0 6px 16px rgba(15, 118, 110, 0.25)',
                            transform: 'translateY(-1px)'
                          },
                          '&:active': {
                            transform: 'translateY(0)'
                          },
                          '&.Mui-disabled': {
                            backgroundColor: '#e2e8f0',
                            color: '#94a3b8'
                          }
                        }}
                      >
                        {validacoes[agendamento.id]?.podeIniciar
                          ? '▶ Iniciar Atendimento'
                          : '⏰ Aguardando Horário'}
                      </Button>
                    ) : (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Aguarde o cuidador iniciar o atendimento.
                      </Alert>
                    )}
                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => atualizarStatus(agendamento.id, 'CANCELADO')}
                      sx={{
                        borderRadius: 2.5,
                        py: 0.75,
                        fontWeight: 500,
                        textTransform: 'none',
                        color: '#dc2626',
                        fontSize: '0.85rem',
                        '&:hover': {
                          backgroundColor: '#fef2f2'
                        }
                      }}
                    >
                      Cancelar Agendamento
                    </Button>
                  </Stack>
                </Box>
              )}

              {agendamento.status === 'EM_ANDAMENTO' && (
                <Box sx={{ p: 3, pt: 0 }}>
                  <Stack spacing={1.5}>
                    <Alert severity="success" sx={{ fontSize: '0.825rem', borderRadius: 2 }}>
                      Atendimento em andamento. Não esqueça de preencher o registro de acompanhamento!
                    </Alert>
                    {isUserCuidador ? (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => atualizarStatus(agendamento.id, 'CONCLUIDO')}
                        sx={{
                          borderRadius: 2.5,
                          py: 1.15,
                          fontWeight: 700,
                          textTransform: 'none',
                          backgroundColor: '#16a34a',
                          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)',
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: '#15803d',
                            boxShadow: '0 6px 16px rgba(22, 163, 74, 0.25)',
                            transform: 'translateY(-1px)'
                          },
                          '&:active': {
                            transform: 'translateY(0)'
                          }
                        }}
                      >
                        ✓ Finalizar Atendimento
                      </Button>
                    ) : (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        O cuidador pode finalizar o atendimento quando concluído.
                      </Alert>
                    )}
                  </Stack>
                </Box>
              )}

              {(agendamento.status === 'CONCLUIDO' || agendamento.status === 'CANCELADO') && (
                <Box sx={{ p: 3, pt: 0 }}>
                  <Alert
                    severity={agendamento.status === 'CONCLUIDO' ? 'success' : 'error'}
                    sx={{ fontSize: '0.825rem', borderRadius: 2 }}
                  >
                    {agendamento.status === 'CONCLUIDO'
                      ? '✓ Atendimento concluído com sucesso!'
                      : '✕ Este agendamento foi cancelado.'}
                  </Alert>
                  {agendamento.status === 'CONCLUIDO' && !isUserCuidador && userId === agendamento.clienteId && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          // abrir modal de avaliação e pré-selecionar o agendamento
                          setAvaliacaoCuidadorId(agendamento.cuidadorId ?? undefined as any);
                          setAvaliacaoCuidadorNome(agendamento.cuidadorNome);
                          setAvaliacaoAgendamentoId(agendamento.id);
                          setAvaliacoesModalOpen(true);
                        }}
                        sx={{
                          borderRadius: 2.5,
                          py: 1.15,
                          fontWeight: 700,
                          textTransform: 'none',
                          backgroundColor: '#0f766e',
                          '&:hover': {
                            backgroundColor: '#0d625b',
                          }
                        }}
                      >
                        Avaliar Atendimento
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Card>
          ))}
        </Box>
      )}
      {/* Modal de Avaliação (pré-seleciona agendamento quando aberto daqui) */}
      {avaliacaoModalOpen && avaliacaoCuidadorId && userId && (
        <AvaliacaoModal
          open={avaliacaoModalOpen}
          onClose={() => setAvaliacoesModalOpen(false)}
          cuidadorId={avaliacaoCuidadorId}
          cuidadorNome={avaliacaoCuidadorNome || ''}
          clienteId={userId}
          initialAgendamentoId={avaliacaoAgendamentoId ?? undefined}
        />
      )}

      {/* Modal de Reproposta de Data */}
      {repropostaModalOpen && agendamentoReproposta && (
        <RepropostaDataModal
          open={repropostaModalOpen}
          onClose={() => {
            setRepropostaModalOpen(false);
            setAgendamentoReproposta(null);
          }}
          agendamentoId={agendamentoReproposta.id}
          clienteNome={agendamentoReproposta.clienteNome}
          dataOriginal={agendamentoReproposta.dataHoraInicio}
          onSuccess={carregarAgendamentos}
        />
      )}

      {/* Dialog de Confirmação de Chat Premium */}
      <Dialog
        open={chatConfirmOpen}
        TransitionComponent={Zoom}
        transitionDuration={280}
        onClose={() => setChatConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.42)',
            backdropFilter: 'blur(3px)',
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: '#ffffff',
            boxShadow: '0 22px 55px rgba(15, 23, 42, 0.24)',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid rgba(15, 118, 110, 0.12)',
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: '0 0 auto 0',
            height: 92,
            background: 'linear-gradient(135deg, #0f766e 0%, #22c55e 100%)',
          }}
        />
        {/* Botão Fechar no Canto Superior Direito */}
        <IconButton
          aria-label="Fechar"
          onClick={() => setChatConfirmOpen(false)}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            width: 34,
            height: 34,
            color: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.16)',
            transition: 'background-color 0.2s, transform 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.26)',
              transform: 'scale(1.04)',
            }
          }}
        >
          <Close fontSize="small" />
        </IconButton>

        <DialogContent sx={{ textAlign: 'center', px: 3, pb: 1.5, pt: 5.5, position: 'relative' }}>
          {/* Círculo do Ícone Animado com Aura Glowing */}
          <Box
            sx={{
              width: 82,
              height: 82,
              margin: '0 auto 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '6px solid rgba(240, 253, 244, 0.92)',
              boxShadow: '0 14px 30px rgba(15, 118, 110, 0.26)',
            }}
          >
            <CheckCircle sx={{ fontSize: 46, color: '#16a34a' }} />
          </Box>

          <Chip
            icon={<Forum sx={{ fontSize: 16 }} />}
            label="Chat liberado"
            size="small"
            sx={{
              mb: 1.5,
              height: 28,
              borderRadius: 1,
              fontWeight: 700,
              color: '#0f766e',
              backgroundColor: '#ecfdf5',
              border: '1px solid #bbf7d0',
              '& .MuiChip-icon': { color: '#0f766e' },
            }}
          />

          <Typography
            variant="h5"
            fontWeight={800}
            gutterBottom
            sx={{
              color: '#102a43',
              letterSpacing: 0,
              lineHeight: 1.2,
            }}
          >
            Agendamento Confirmado!
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#52616b',
              lineHeight: 1.6,
              maxWidth: 340,
              mx: 'auto',
              mb: 1.25,
            }}
          >
            Sua disponibilidade foi confirmada com sucesso. O chat com o cliente esta disponivel.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#0f766e',
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            Deseja ir para o chat agora?
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'center',
            px: 3,
            pb: 3,
            pt: 1,
            gap: 1.25,
            flexDirection: { xs: 'column-reverse', sm: 'row' },
          }}
        >
          <Button
            onClick={() => setChatConfirmOpen(false)}
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: 1,
              py: 1.15,
              fontWeight: 700,
              color: '#475569',
              borderColor: '#cbd5e1',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#94a3b8',
                backgroundColor: '#f8fafc',
              }
            }}
          >
            Permanecer aqui
          </Button>

          <Button
            onClick={() => {
              setChatConfirmOpen(false);
              navigate('/carehub/chat');
            }}
            variant="contained"
            startIcon={<Forum />}
            fullWidth
            sx={{
              borderRadius: 1,
              py: 1.15,
              fontWeight: 800,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #0f766e 0%, #16a34a 100%)',
              boxShadow: '0 12px 22px rgba(15, 118, 110, 0.26)',
              color: '#ffffff',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                background: 'linear-gradient(135deg, #115e59 0%, #15803d 100%)',
                boxShadow: '0 14px 26px rgba(15, 118, 110, 0.34)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              }
            }}
          >
            Ir para o Chat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
