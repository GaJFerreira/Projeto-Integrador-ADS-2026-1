import { useEffect, useState } from 'react';
import { agendamentosApi, cuidadoresApi } from '../api';
import type { AgendamentoRequestDTO } from '../types';
import { Box, Button, Card, CardContent, Chip, CircularProgress, MenuItem, Stack, TextField, Typography, Paper, Divider, Alert, Avatar } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '../libSnackbar';
import { PageHeader } from '../components/PageHeader';
import dayjs from 'dayjs';
import { parseDate } from '../utils/dateUtils';
import { CalendarMonth, Schedule, CheckCircle, Cancel, AccessTime, Person, LocationOn } from '@mui/icons-material';

import { getUserId, isCuidador as isRoleCuidador, checkAndCacheUserType } from '../components/auth';
import http from '../libHttp';

export default function AgendamentosPage() {
  // feature-level accessibility styles
  import('../components/carehub-accessibility.css');
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [isCuidador, setIsCuidador] = useState<boolean>(false);
  const params = new URLSearchParams(window.location.search);
  const initialCuidador = Number(params.get('cuidadorId') || '') || undefined;

  const [clienteId, setClienteId] = useState<number | undefined>(undefined);
  const [cuidadorId, setCuidadorId] = useState<number | undefined>(initialCuidador);
  const [inicio, setInicio] = useState<string>(dayjs().add(30, 'minute').format('YYYY-MM-DDTHH:mm'));
  const [fim, setFim] = useState<string>(dayjs().add(1, 'hour').add(30, 'minute').format('YYYY-MM-DDTHH:mm'));
  const [tipo, setTipo] = useState<string>('DOMICILIO'); // ✅ Corrigido de DOMICILIAR para DOMICILIO

  // Filtros de visualização
  const [filtroData, setFiltroData] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');

  // Inicialização: cache do tipo de usuário e fetch cliente ID
  useEffect(() => {
    const inicializar = async () => {
      await checkAndCacheUserType();
      let perfilRole = '';
      let perfilUserId: number | undefined;

      try {
        const { data } = await http.get('/api/carehub/perfil');
        perfilRole = String(data?.role || '').toUpperCase();
        perfilUserId = Number(data?.platformUserId || data?.id) || undefined;
      } catch {
        // Mantem fallback local quando o perfil nao puder ser carregado.
      }

      const ehCuidador = perfilRole
        ? perfilRole.includes('CUIDADOR')
        : isRoleCuidador();

      setIsCuidador(ehCuidador);

      const uid = perfilUserId || getUserId();
      if (uid) {
        setClienteId(uid);
      }
    };
    inicializar();
  }, []);

  // Fetch cuidadores list
  const { data: cuidadores = [] } = useQuery({
    queryKey: ['cuidadores-list'],
    queryFn: async () => {
      const arr = await cuidadoresApi.listarTodos();
      return arr.map(c => ({ id: c.platformUserId || c.id, nome: c.nome }));
    },
  });

  // Fetch agendamentos - APENAS quando tiver clienteId ou cuidadorId
  const { data: lista = [], isLoading, isError } = useQuery({
    queryKey: ['agendamentos', isCuidador, cuidadorId, clienteId],
    queryFn: async () => {
      if (isCuidador && cuidadorId) return agendamentosApi.porCuidador(cuidadorId);
      if (clienteId) return agendamentosApi.porCliente(clienteId);
      return [];
    },
    enabled: !!(isCuidador ? cuidadorId : clienteId), // CRUCIAL: só busca quando tem ID
    staleTime: 5000, // Cache por 5 segundos
  });

  // Criar agendamento
  const criarMutation = useMutation({
    mutationFn: (dto: AgendamentoRequestDTO) => agendamentosApi.criar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      enqueueSnackbar('Agendamento criado com sucesso!', { variant: 'success' });
      setInicio(dayjs().add(30, 'minute').format('YYYY-MM-DDTHH:mm'));
      setFim(dayjs().add(1, 'hour').add(30, 'minute').format('YYYY-MM-DDTHH:mm'));
    },
    onError: (error: any) => {
      const msg = error?.message || 'Erro ao criar agendamento';
      enqueueSnackbar(msg, { variant: 'error' });
    },
  });

  // Atualizar status
  const atualizarStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      agendamentosApi.atualizarStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      enqueueSnackbar('Status atualizado!', { variant: 'success' });
    },
    onError: (error: any) => {
      const msg = error?.message || 'Erro ao atualizar status';
      enqueueSnackbar(msg, { variant: 'error' });
    },
  });

  const criar = () => {
    if (!cuidadorId || !clienteId) {
      enqueueSnackbar('Selecione um cuidador', { variant: 'warning' });
      return;
    }

    const dInicio = dayjs(inicio);
    const dFim = dayjs(fim);

    // Validações simples no cliente
    if (dFim.isBefore(dInicio)) {
      enqueueSnackbar('A data/hora de fim deve ser posterior à de início', { variant: 'warning' });
      return;
    }

    if (dInicio.isBefore(dayjs())) {
      enqueueSnackbar('A data/hora de início não pode ser no passado', { variant: 'warning' });
      return;
    }

    // ✅ Usar formato local sem conversão para UTC
    const dataInicio = dInicio.toDate().toISOString();
    const dataFim = dFim.toDate().toISOString();

    criarMutation.mutate({
      clienteId,
      cuidadorId,
      dataHoraInicio: dataInicio,
      dataHoraFim: dataFim,
      tipoAtendimento: tipo
    });
  };

  // -----------------------------------------------------------------------------------------------------------

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMADO': return 'success';
      case 'CANCELADO': return 'error';
      case 'CONCLUIDO': return 'success';
      case 'EM_ANDAMENTO': return 'info';
      case 'REAGENDADO': return 'warning';
      default: return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'PENDENTE';
      case 'CONFIRMADO': return 'CONFIRMADO';
      case 'EM_ANDAMENTO': return 'EM ANDAMENTO';
      case 'CONCLUIDO': return 'CONCLUÍDO';
      case 'CANCELADO': return 'CANCELADO';
      case 'REAGENDADO': return 'REAGENDADO';
      default: return status;
    }
  };

  return (
    <Stack gap={3} sx={{ p: 2 }}>
      {/* Header com botão VOLTAR */}
      <PageHeader
        title="Agendamentos"
        subtitle="Gerencie seus atendimentos e horários"
      />

      {/* Formulário de Criação - somente para clientes (idosos/familiares) */}
      {!isCuidador ? (
        <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Novo Agendamento</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} gap={2} flexWrap="wrap">
              <TextField
                select
                label="Cuidador"
                value={cuidadorId ?? ''}
                onChange={(e) => setCuidadorId(Number(e.target.value) || undefined)}
                size="small"
                sx={{ minWidth: 220 }}
                required
              >
                <MenuItem value="">Selecione um cuidador</MenuItem>
                {cuidadores.map(c => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
              </TextField>

              <TextField
                label="Data/Hora Início"
                type="datetime-local"
                size="small"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 200 }}
              />

              <TextField
                label="Data/Hora Fim"
                type="datetime-local"
                size="small"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 200 }}
              />

              <TextField
                select
                label="Tipo Atendimento"
                size="small"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="DOMICILIO">Domiciliar</MenuItem>
                <MenuItem value="PRESENCIAL">Presencial</MenuItem>
                <MenuItem value="ACOMPANHAMENTO">Acompanhamento</MenuItem>
              </TextField>

              <Button
                variant="contained"
                onClick={criar}
                disabled={criarMutation.isPending || !clienteId || !cuidadorId}
                sx={{ minWidth: 120 }}
              >
                {criarMutation.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Você está logado como cuidador. Agendamentos devem ser propostos por clientes (idosos/familiares). Acompanhe e confirme propostas em <strong>Meus Agendamentos</strong>.
        </Alert>
      )}

      {/* Filtros de Visualização */}
      {lista.length > 0 && (
        <Card variant="outlined" sx={{ bgcolor: 'background.default', mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Filtros
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
              <TextField
                label="Filtrar por Data"
                type="date"
                size="small"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 200 }}
                helperText="Deixe vazio para ver todos"
              />

              <TextField
                select
                label="Status"
                size="small"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="TODOS">Todos os status</MenuItem>
                <MenuItem value="PENDENTE">Pendente</MenuItem>
                <MenuItem value="CONFIRMADO">Confirmado</MenuItem>
                <MenuItem value="EM_ANDAMENTO">Em Andamento</MenuItem>
                <MenuItem value="CONCLUIDO">Concluído</MenuItem>
                <MenuItem value="CANCELADO">Cancelado</MenuItem>
                <MenuItem value="REAGENDADO">Reagendado</MenuItem>
              </TextField>

              <TextField
                select
                label="Tipo de Atendimento"
                size="small"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="TODOS">Todos os tipos</MenuItem>
                <MenuItem value="DOMICILIO">Domiciliar</MenuItem>
                <MenuItem value="PRESENCIAL">Presencial</MenuItem>
                <MenuItem value="ACOMPANHAMENTO">Acompanhamento</MenuItem>
              </TextField>

              {(filtroData || filtroStatus !== 'TODOS' || filtroTipo !== 'TODOS') && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFiltroData('');
                    setFiltroStatus('TODOS');
                    setFiltroTipo('TODOS');
                  }}
                  size="small"
                >
                  Limpar Filtros
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Lista de Agendamentos */}
      {isLoading && (
        <Stack alignItems="center" py={4}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" mt={2}>
            Carregando agendamentos...
          </Typography>
        </Stack>
      )}

      {isError && (
        <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
          <CardContent>
            <Typography>Erro ao carregar agendamentos. Tente novamente.</Typography>
          </CardContent>
        </Card>
      )}

      {!isLoading && lista.length === 0 && (
        <Card variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
          <Schedule sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary">
            Nenhum agendamento encontrado. Crie o primeiro!
          </Typography>
        </Card>
      )}

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
        {lista
          .filter((a) => {
            // Filtro por data
            if (filtroData) {
              const dataInicio = parseDate(a.dataHoraInicio);
              const dataAgendamento = dataInicio ? dayjs(dataInicio).format('YYYY-MM-DD') : '';
              if (dataAgendamento !== filtroData) return false;
            }

            // Filtro por status
            if (filtroStatus !== 'TODOS' && a.status !== filtroStatus) {
              return false;
            }

            // Filtro por tipo
            if (filtroTipo !== 'TODOS' && a.tipoAtendimento !== filtroTipo) {
              return false;
            }

            return true;
          })
          .map((a) => {
            const dataInicio = parseDate(a.dataHoraInicio);
            const dataFim = parseDate(a.dataHoraFim);
            const isNowByTime = dataInicio && dataFim
              ? dayjs().isAfter(dayjs(dataInicio)) && dayjs().isBefore(dayjs(dataFim))
              : false;
            const isNow = a.status === 'EM_ANDAMENTO' && isNowByTime;
            const isPast = a.status === 'CONCLUIDO' || (dataFim ? dayjs(dataFim).isBefore(dayjs()) : false);
            const durationMinutes = dataInicio && dataFim ? Math.max(dayjs(dataFim).diff(dayjs(dataInicio), 'minute'), 0) : 0;
            const durationLabel = durationMinutes >= 60
              ? `${Math.floor(durationMinutes / 60)}h${durationMinutes % 60 ? ` ${durationMinutes % 60}min` : ''}`
              : `${durationMinutes}min`;
            const statusAccent =
              a.status === 'CONCLUIDO'
                ? 'success.main'
                : a.status === 'CANCELADO'
                  ? 'error.main'
                  : a.status === 'EM_ANDAMENTO'
                    ? 'info.main'
                    : a.status === 'CONFIRMADO'
                      ? 'success.light'
                      : a.status === 'REAGENDADO'
                        ? '#ea580c'
                        : '#d97706'; // PENDENTE

            const getTimelineStyle = (status: string, now: boolean) => {
              switch (status) {
                case 'CONCLUIDO':
                  return {
                    bgcolor: '#f0fdf4',
                    borderColor: '#bbf7d0',
                    textColor: '#15803d',
                    labelText: 'CONCLUÍDO',
                    iconColor: '#16a34a'
                  };
                case 'CANCELADO':
                  return {
                    bgcolor: '#fef2f2',
                    borderColor: '#fecaca',
                    textColor: '#b91c1c',
                    labelText: 'CANCELADO',
                    iconColor: '#dc2626'
                  };
                case 'EM_ANDAMENTO':
                  return {
                    bgcolor: '#eff6ff',
                    borderColor: '#bfdbfe',
                    textColor: '#1d4ed8',
                    labelText: 'ACONTECENDO AGORA',
                    iconColor: '#2563eb'
                  };
                case 'CONFIRMADO':
                  return {
                    bgcolor: '#f0fdfa',
                    borderColor: '#99f6e4',
                    textColor: '#0f766e',
                    labelText: 'CONFIRMADO',
                    iconColor: '#0f766e'
                  };
                case 'REAGENDADO':
                  return {
                    bgcolor: '#fff7ed',
                    borderColor: '#ffedd5',
                    textColor: '#c2410c',
                    labelText: 'PROPOSTA REAGENDADA',
                    iconColor: '#ea580c'
                  };
                default:
                  return {
                    bgcolor: '#fffbeb',
                    borderColor: '#ffedd5',
                    textColor: '#b45309',
                    labelText: 'AGUARDANDO CONFIRMAÇÃO',
                    iconColor: '#d97706'
                  };
              }
            };

            const timelineStyle = getTimelineStyle(a.status, isNow);

            return (
              <Card
                key={a.id}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: isNow ? 'info.light' : 'rgba(0, 0, 0, 0.06)',
                  borderRadius: 4,
                  backgroundColor: 'background.paper',
                  boxShadow: isNow
                    ? '0 12px 28px rgba(2, 132, 199, 0.12)'
                    : '0 4px 20px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: '0 auto 0 0',
                    width: 5,
                    backgroundColor: statusAccent,
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
                    borderColor: isNow ? 'info.main' : 'rgba(15, 23, 42, 0.15)',
                  }
                }}
              >
                {/* Badge de status visual */}
                {isNow && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: 16,
                      bgcolor: 'success.main',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                      animation: 'pulse 2s infinite'
                    }}
                  >
                    ● EM ANDAMENTO
                  </Box>
                )}

                <CardContent sx={{ p: 3 }}>
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ letterSpacing: '0.05em' }}>
                        AGENDAMENTO #{a.id}
                      </Typography>
                      <Stack direction="row" spacing={1.5} alignItems="center" mt={0.5}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            background: '#1565C0',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                          }}
                        >
                          {(a.cuidadorNome || 'C').charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#1e293b' }}>
                          {a.cuidadorNome || 'Cuidador'}
                        </Typography>
                      </Stack>
                    </Box>
                    <Chip
                      label={getStatusLabel(a.status)}
                      color={getStatusColor(a.status)}
                      size="small"
                      sx={{
                        fontWeight: 'bold',
                        borderRadius: 1.5,
                        px: 0.5,
                        textTransform: 'uppercase',
                        fontSize: '0.72rem'
                      }}
                      icon={
                        a.status === 'CONFIRMADO' || a.status === 'CONCLUIDO' ? <CheckCircle fontSize="small" /> :
                          a.status === 'CANCELADO' ? <Cancel fontSize="small" /> :
                            <AccessTime fontSize="small" />
                      }
                    />
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  {/* Informações principais */}
                  <Stack spacing={1.5} mb={2}>
                    <Stack direction="row" alignItems="center" gap={1.25}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ color: '#475569' }}>
                        <strong>Cliente:</strong> {a.clienteNome || '-'}
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" gap={1.25}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ color: '#475569' }}>
                        <strong>Tipo:</strong> {a.tipoAtendimento || 'Não especificado'}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Timeline visual */}
                  <Paper
                    elevation={0}
                    sx={{
                      bgcolor: timelineStyle.bgcolor,
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: timelineStyle.borderColor,
                      mb: 2
                    }}
                  >
                    <Stack direction="row" alignItems="center" gap={1} mb={1}>
                      <AccessTime fontSize="small" sx={{ color: timelineStyle.iconColor }} />
                      <Typography variant="caption" fontWeight="bold" sx={{ color: timelineStyle.textColor, letterSpacing: '0.05em' }}>
                        {timelineStyle.labelText}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                      <Chip
                        icon={<CalendarMonth fontSize="small" style={{ color: timelineStyle.textColor }} />}
                        label={dataInicio ? dayjs(dataInicio).format('DD/MM/YYYY') : '-'}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: '600',
                          borderColor: timelineStyle.borderColor,
                          color: timelineStyle.textColor,
                          bgcolor: 'rgba(255, 255, 255, 0.6)',
                          '& .MuiChip-icon': { color: 'inherit' }
                        }}
                      />
                      {dataInicio && dataFim ? (
                        <>
                          <Typography variant="body2" fontWeight="700" sx={{ color: timelineStyle.textColor }}>
                            {dayjs(dataInicio).format('HH:mm')} → {dayjs(dataFim).format('HH:mm')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: timelineStyle.textColor, opacity: 0.8, fontWeight: 500 }}>
                            ({durationLabel})
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Horário não informado
                        </Typography>
                      )}
                    </Stack>
                  </Paper>

                  {/* Observações */}
                  {a.observacoes && (
                    <Paper
                      elevation={0}
                      sx={{
                        bgcolor: 'grey.50',
                        p: 1.5,
                        borderRadius: 1.5,
                        mb: 2,
                        border: '1px dashed',
                        borderColor: 'grey.300'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" mb={0.5} sx={{ letterSpacing: '0.05em' }}>
                        OBSERVAÇÕES
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#475569' }}>
                        "{a.observacoes}"
                      </Typography>
                    </Paper>
                  )}

                  {/* Botões de ação */}
                  <Stack direction="row" gap={1}>

                    {isCuidador && a.cuidadorId === getUserId() && a.status !== 'CONFIRMADO' && a.status !== 'CANCELADO' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        disabled={atualizarStatusMutation.isPending}
                        onClick={() => atualizarStatusMutation.mutate({ id: a.id, status: 'CONFIRMADO' })}
                        fullWidth
                        startIcon={<CheckCircle />}
                        sx={{ borderRadius: 2, py: 0.75, textTransform: 'none', fontWeight: 'bold' }}
                      >
                        Confirmar
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
      </Box>
    </Stack>
  );
}
