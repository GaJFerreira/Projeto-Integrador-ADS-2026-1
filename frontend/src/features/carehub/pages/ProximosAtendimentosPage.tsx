import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Chip,
  CircularProgress,
  Divider,
  Button,
  Avatar,
} from '@mui/material';
import {
  CalendarToday,
  Person,
  Event,
  CheckCircle,
  Schedule,
  Star,
  HourglassEmpty,
  CheckBox,
  Cancel,
} from '@mui/icons-material';
import http from '../libHttp';
import { getUserId } from '../components/auth';
import { PageHeader } from '../components/PageHeader';
import { AvaliacaoModal } from '../components/AvaliacaoModal';
import { parseDate } from '../utils/dateUtils';

interface Agendamento {
  id: number;
  cuidadorId: number;
  cuidadorNome: string;
  clienteId: number;
  clienteNome: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: string;
  observacoes?: string;
  tipoAtendimento?: string;
}

export function ProximosAtendimentosPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [avaliacaoModalOpen, setAvaliacaoModalOpen] = useState(false);
  const [cuidadorSelecionado, setCuidadorSelecionado] = useState<{ id: number, nome: string } | null>(null);
  const [agendamentoAvaliacao, setAgendamentoAvaliacao] = useState<number | null>(null);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
  }, []);

  const { data: agendamentos = [], isLoading, error } = useQuery<Agendamento[]>({
    queryKey: ['proximos-atendimentos', userId],
    queryFn: async () => {
      // Este endpoint usa Principal no backend (autenticação JWT).
      // Autenticacao apenas por token JWT (Authorization via interceptor).
      const response = await http.get<Agendamento[]>('/api/carehub/agendamentos/proximos', {
        params: { dias: 7 },
      });
      return Array.isArray(response.data) ? response.data : (response.data as any)?.content ?? [];
    },
    enabled: !!userId, // Só executa quando userId estiver disponível
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return <HourglassEmpty fontSize="small" />;
      case 'CONFIRMADO':
        return <CheckCircle fontSize="small" />;
      case 'EM_ANDAMENTO':
        return <Schedule fontSize="small" />;
      case 'CONCLUIDO':
        return <CheckBox fontSize="small" />;
      case 'CANCELADO':
        return <Cancel fontSize="small" />;
      default:
        return <Event fontSize="small" />;
    }
  };

  // Função para formatar data sem biblioteca externa
  const formatarData = (dataString: string) => {
    const data = parseDate(dataString);
    if (!data) return '-';
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    const diaSemana = diasSemana[data.getDay()];
    const dia = data.getDate();
    const mes = meses[data.getMonth()];
    const horas = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');

    return `${diaSemana}, ${dia} de ${mes} às ${horas}:${minutos}`;
  };

  const formatarDataCurta = (dataString: string) => {
    const data = parseDate(dataString);
    if (!data) return '-';
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    const horas = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');

    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
  };

  const getDiasRestantes = (dataString: string) => {
    // Comparar apenas as datas (ignorando horário) para determinar Hoje/Amanhã/X dias
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera o horário para comparar só a data

    const dataAgendamento = parseDate(dataString);
    if (!dataAgendamento) return 'Data inválida';
    dataAgendamento.setHours(0, 0, 0, 0); // Zera o horário para comparar só a data

    const diferencaMs = dataAgendamento.getTime() - hoje.getTime();
    const diferencaDias = Math.round(diferencaMs / (1000 * 60 * 60 * 24));

    if (diferencaDias === 0) {
      return 'Hoje';
    } else if (diferencaDias === 1) {
      return 'Amanhã';
    } else if (diferencaDias < 0) {
      return 'Passado';
    } else {
      return `Em ${diferencaDias} dias`;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px" gap={2}>
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          Carregando próximos atendimentos...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          <Typography variant="h6">Erro ao carregar atendimentos</Typography>
          <Typography variant="body2">
            Não foi possível carregar seus próximos atendimentos. Tente novamente mais tarde.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Próximos Atendimentos"
        subtitle="Seus agendamentos para os próximos dias"
        backTo="/carehub/agendamentos-menu"
      />

      {agendamentos.length > 0 ? (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>{agendamentos.length}</strong> atendimento(s) agendado(s) nos próximos 7 dias
          </Alert>

          <Box display="flex" flexDirection="column" gap={2}>
            {agendamentos.map((agendamento) => (
              <Card
                key={agendamento.id}
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: '1px solid rgba(15, 118, 110, 0.08)',
                  borderLeft: 5,
                  borderLeftColor:
                    agendamento.status === 'CONFIRMADO' ? '#0f766e' :
                      agendamento.status === 'EM_ANDAMENTO' ? '#1d4ed8' :
                        agendamento.status === 'CONCLUIDO' ? '#15803d' :
                          agendamento.status === 'CANCELADO' ? '#b91c1c' :
                            '#d97706', // PENDENTE ou outros
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} mb={2.5}>
                    <Box display="flex" alignItems="center" gap={1.25}>
                      <CalendarToday sx={{ color: '#1565C0', fontSize: 20 }} />
                      <Typography variant="body1" fontWeight="700" sx={{ color: '#1e293b' }}>
                        {formatarData(agendamento.dataHoraInicio)}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      {/* Chip de dias restantes (ex: Hoje) */}
                      {getDiasRestantes(agendamento.dataHoraInicio) !== 'Passado' && (
                        <Chip
                          label={getDiasRestantes(agendamento.dataHoraInicio)}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 24,
                            borderRadius: 1,
                            backgroundColor: '#fffbeb',
                            color: '#d97706',
                            border: '1px solid #fde68a'
                          }}
                        />
                      )}
                      {/* Chip de Status */}
                      <Chip
                        icon={getStatusIcon(agendamento.status)}
                        label={getStatusLabel(agendamento.status)}
                        variant="outlined"
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          height: 24,
                          borderRadius: 1,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          px: 0.5,
                          '& .MuiChip-icon': {
                            color: 'inherit',
                            fontSize: '0.9rem',
                            marginLeft: '4px',
                            marginRight: '-4px'
                          },
                          ...getStatusStyles(agendamento.status)
                        }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2.5, borderColor: 'rgba(15, 118, 110, 0.08)' }} />

                  {/* Grid de Informações com Avatares circulares no padrão do Carehub */}
                  <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5} mb={2.5}>
                    {/* Cuidador */}
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: '#1565C014',
                          color: '#1565C0',
                          border: '1px solid rgba(15, 118, 110, 0.12)',
                          fontWeight: 700,
                          fontSize: '0.95rem'
                        }}
                      >
                        {agendamento.cuidadorNome.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          CUIDADOR
                        </Typography>
                        <Typography variant="body2" fontWeight="700" sx={{ color: '#1e293b', mt: 0.25 }}>
                          {agendamento.cuidadorNome}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Cliente */}
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid rgba(29, 78, 216, 0.12)',
                          fontWeight: 700,
                          fontSize: '0.95rem'
                        }}
                      >
                        {agendamento.clienteNome.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          CLIENTE
                        </Typography>
                        <Typography variant="body2" fontWeight="700" sx={{ color: '#1e293b', mt: 0.25 }}>
                          {agendamento.clienteNome}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Detalhes de Período e Tipo de Atendimento */}
                  <Box
                    sx={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 3,
                      p: 2,
                      border: '1px solid #f1f5f9',
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr' },
                      gap: 2
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.25}>
                      <Schedule sx={{ fontSize: 18, color: '#64748b' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          PERÍODO
                        </Typography>
                        <Typography variant="body2" fontWeight="600" sx={{ color: '#334155', mt: 0.25, fontSize: '0.825rem' }}>
                          {formatarDataCurta(agendamento.dataHoraInicio)} às {formatarDataCurta(agendamento.dataHoraFim).split(' ')[1]}
                        </Typography>
                      </Box>
                    </Box>

                    {agendamento.tipoAtendimento && (
                      <Box display="flex" alignItems="center" gap={1.25}>
                        <Event sx={{ fontSize: 18, color: '#1565C0' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            TIPO DE ATENDIMENTO
                          </Typography>
                          <Typography variant="body2" fontWeight="700" sx={{ color: '#1565C0', mt: 0.25, fontSize: '0.825rem', textTransform: 'uppercase' }}>
                            {agendamento.tipoAtendimento}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Bloco de Observações estilizado */}
                  {agendamento.observacoes && (
                    <Box
                      sx={{
                        mt: 2.5,
                        p: 2,
                        backgroundColor: '#fffdf5',
                        borderLeft: '3px solid #f59e0b',
                        borderRadius: '0 8px 8px 0',
                      }}
                    >
                      <Typography variant="caption" color="#d97706" fontWeight="700" display="block" sx={{ mb: 0.5, fontSize: '0.68rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        OBSERVAÇÕES
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontStyle: 'italic',
                          fontSize: '0.825rem',
                          color: '#b45309',
                          lineHeight: 1.5
                        }}
                      >
                        "{agendamento.observacoes}"
                      </Typography>
                    </Box>
                  )}

                  {/* Botão de Avaliar para atendimentos concluídos */}
                  {agendamento.status === 'CONCLUIDO' && (
                    <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Star />}
                        onClick={() => {
                          setCuidadorSelecionado({
                            id: agendamento.cuidadorId,
                            nome: agendamento.cuidadorNome
                          });
                          setAgendamentoAvaliacao(agendamento.id);
                          setAvaliacaoModalOpen(true);
                        }}
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
                        Avaliar Atendimento
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      ) : (
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            Nenhum atendimento agendado
          </Typography>
          <Typography variant="body2">
            Você não possui atendimentos agendados para os próximos 7 dias.
          </Typography>
        </Alert>
      )}

      {/* Modal de Avaliação */}
      {avaliacaoModalOpen && cuidadorSelecionado && userId && (
        <AvaliacaoModal
          open={avaliacaoModalOpen}
          onClose={() => {
            setAvaliacaoModalOpen(false);
            setCuidadorSelecionado(null);
            setAgendamentoAvaliacao(null);
          }}
          cuidadorId={cuidadorSelecionado.id}
          cuidadorNome={cuidadorSelecionado.nome}
          clienteId={userId}
          initialAgendamentoId={agendamentoAvaliacao ?? undefined}
        />
      )}
    </Box>
  );
}
