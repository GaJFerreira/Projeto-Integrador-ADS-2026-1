import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Badge,
  Tooltip,
  Button,
  Rating,
  Avatar,
} from '@mui/material';
import {
  ExpandMore,
  CalendarToday,
  Person,
  LocalHospital,
  Medication,
  Restaurant,
  DirectionsWalk,
  MoodOutlined,
  Warning,
  MonitorHeart,
  Search,
  Assignment,
  Refresh,
  Star,
  StarBorder,
  RateReview,
} from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import http from '../libHttp';
import { getUserId, isCuidador as isRoleCuidador, checkAndCacheUserType } from '../components/auth';
import { AvaliacaoModal } from '../components/AvaliacaoModal';
import { avaliacoesApi } from '../api';
import { parseDate, formatDateTime } from '../utils/dateUtils';

interface RegistroAcompanhamento {
  id: number;
  agendamentoId: number;
  agendamentoStatus?: string; // Status do agendamento (PENDENTE, CONFIRMADO, EM_ANDAMENTO, CONCLUIDO, etc)
  cuidadorId: number;
  cuidadorNome: string;
  clienteId: number;
  clienteNome: string;
  dataHoraRegistro: string;
  pressaoArterial?: string;
  glicemia?: string;
  medicamentosAdministrados?: string;
  alimentacao?: string;
  atividadesRealizadas?: string;
  observacoes?: string;
  intercorrencias?: string;
  humorEstado?: string;
  sinaisVitais?: string;
  dataCriacao: string;
}

interface AvaliacaoInfo {
  id: number;
  nota: number;
  comentario?: string;
  dataAvaliacao: string;
  agendamentoId: number;
}

const renderInfoBlock = (title: string, content: string, icon: any) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'flex-start',
        p: 2,
        borderRadius: 2.5,
        bgcolor: '#fafafa',
        border: '1px solid #f1f5f9',
        transition: 'background-color 0.2s',
        '&:hover': { bgcolor: '#f8fafc' }
      }}
    >
      <Box
        sx={{
          p: 1,
          borderRadius: 2,
          bgcolor: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary'
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: '750', color: '#1e293b', lineHeight: 1.2 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#475569', mt: 0.75, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
          {content}
        </Typography>
      </Box>
    </Box>
  );
};

export function HistoricoAtendimentosPage() {
  const [registros, setRegistros] = useState<RegistroAcompanhamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [isCuidador, setIsCuidador] = useState<boolean>(false);
  // Mapa de avaliações indexado por agendamentoId para acesso rápido
  const [avaliacoesPorAgendamento, setAvaliacoesPorAgendamento] = useState<{ [agendamentoId: number]: AvaliacaoInfo }>({});
  const [avaliacaoModalOpen, setAvaliacaoModalOpen] = useState(false);
  const [selectedCuidador, setSelectedCuidador] = useState<{ id: number; nome: string } | null>(null);
  const [selectedAgendamentoId, setSelectedAgendamentoId] = useState<number | null>(null);

  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const inicializar = async () => {
      await checkAndCacheUserType();
      const ehCuidador = isRoleCuidador();
      setIsCuidador(ehCuidador);
      const currentUserId = getUserId();
      setUserId(currentUserId);
    };
    inicializar();
  }, []);

  // Carregar histórico quando userId estiver disponível
  useEffect(() => {
    if (userId) {
      carregarHistoricoComTipo(isCuidador);
    }
  }, [userId, isCuidador]);

  const carregarHistoricoComTipo = async (ehCuidador: boolean) => {
    try {
      setLoading(true);

      console.log('🔍 Debug Histórico:');
      console.log('  - userId:', userId);
      console.log('  - isCuidador:', ehCuidador);

      const endpoint = ehCuidador
        ? `/api/carehub/registros/cuidador/${userId}`
        : `/api/carehub/registros/cliente/${userId}`;

      console.log('  - endpoint:', endpoint);

      const response = await http.get(endpoint);
      console.log('  - response.data:', response.data);

      // Ordenar por data mais recente primeiro
      const registrosOrdenados = response.data.sort((a: RegistroAcompanhamento, b: RegistroAcompanhamento) =>
        (parseDate(b.dataHoraRegistro)?.getTime() ?? 0) - (parseDate(a.dataHoraRegistro)?.getTime() ?? 0)
      );
      setRegistros(registrosOrdenados);
      console.log('  - Total de registros:', registrosOrdenados.length);

      // Se for cliente, carregar as avaliações dos agendamentos concluídos
      if (!ehCuidador) {
        // Pegar IDs únicos dos agendamentos concluídos
        const agendamentosConcluidosIds = [...new Set(
          registrosOrdenados
            .filter((r: RegistroAcompanhamento) => r.agendamentoStatus === 'CONCLUIDO')
            .map((r: RegistroAcompanhamento) => r.agendamentoId)
        )] as number[];

        // Pegar IDs únicos dos cuidadores
        const cuidadorIds = [...new Set(registrosOrdenados.map((r: RegistroAcompanhamento) => r.cuidadorId))] as number[];

        await carregarAvaliacoes(cuidadorIds, agendamentosConcluidosIds);
      }

      setError(null);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setError('Erro ao carregar histórico de atendimentos');
    } finally {
      setLoading(false);
    }
  };

  // Carrega avaliações e indexa por agendamentoId para acesso O(1)
  const carregarAvaliacoes = async (cuidadorIds: number[], agendamentosIds: number[]) => {
    try {
      const avaliacoesMap: { [agendamentoId: number]: AvaliacaoInfo } = {};

      for (const cuidadorId of cuidadorIds) {
        const avs = await avaliacoesApi.porCuidador(cuidadorId);

        // Filtrar apenas as avaliações do cliente atual e indexar por agendamentoId
        avs
          .filter((av: any) => Number(av.clienteId) === Number(userId) && av.agendamentoId)
          .forEach((av: any) => {
            const agendamentoId = Number(av.agendamentoId);
            // Só adiciona se o agendamento está na lista de interesse
            if (agendamentosIds.includes(agendamentoId)) {
              avaliacoesMap[agendamentoId] = {
                id: av.id,
                nota: av.nota,
                comentario: av.comentario,
                dataAvaliacao: av.dataAvaliacao,
                agendamentoId: agendamentoId,
              };
            }
          });
      }

      console.log('📊 Mapa de avaliações por agendamento:', avaliacoesMap);
      setAvaliacoesPorAgendamento(avaliacoesMap);
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err);
    }
  };

  const abrirAvaliacaoModal = (cuidadorId: number, cuidadorNome: string, agendamentoId: number) => {
    setSelectedCuidador({ id: cuidadorId, nome: cuidadorNome });
    setSelectedAgendamentoId(agendamentoId);
    setAvaliacaoModalOpen(true);
  };

  const fecharAvaliacaoModal = async () => {
    setAvaliacaoModalOpen(false);
    setSelectedCuidador(null);
    setSelectedAgendamentoId(null);
    // Recarregar dados após avaliar
    if (!isCuidador) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Recarregar todo o histórico para atualizar os dados
      carregarHistoricoComTipo(false);
    }
  };

  // Verificar se um agendamento já foi avaliado - acesso O(1) pelo mapa
  const getAvaliacaoDoAgendamento = (agendamentoId: number): AvaliacaoInfo | undefined => {
    return avaliacoesPorAgendamento[agendamentoId];
  };

  const formatarData = (dataISO: string) => {
    return formatDateTime(dataISO, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filtrar registros pela busca
  const registrosFiltrados = registros.filter(registro => {
    const termoBusca = busca.toLowerCase();
    return (
      registro.clienteNome.toLowerCase().includes(termoBusca) ||
      registro.cuidadorNome.toLowerCase().includes(termoBusca) ||
      registro.observacoes?.toLowerCase().includes(termoBusca) ||
      registro.medicamentosAdministrados?.toLowerCase().includes(termoBusca)
    );
  });

  // Agrupar registros - por cliente se for cuidador, por cuidador se for cliente
  const registrosAgrupados = registrosFiltrados.reduce((acc, registro) => {
    const chave = isCuidador ? registro.clienteId : registro.cuidadorId;
    const nome = isCuidador ? registro.clienteNome : registro.cuidadorNome;

    if (!acc[chave]) {
      acc[chave] = {
        nome: nome,
        registros: []
      };
    }
    acc[chave].registros.push(registro);
    return acc;
  }, {} as Record<number, { nome: string; registros: RegistroAcompanhamento[] }>);

  if (loading) {
    return (
      <Box>
        <PageHeader title="Histórico de Atendimentos" backTo="/carehub/agendamentos-menu" />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!userId) {
    return (
      <Box>
        <PageHeader title="Histórico de Atendimentos" backTo="/carehub/agendamentos-menu" />
        <Alert severity="warning">Faça login para ver seu histórico de atendimentos.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Histórico de Atendimentos"
        subtitle={isCuidador ? "Registros de atendimentos com seus clientes" : "Registros de atendimentos com seus cuidadores"}
        backTo="/carehub/agendamentos-menu"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Botão de recarregar */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => carregarHistoricoComTipo(isCuidador)}
          disabled={loading}
        >
          Recarregar
        </Button>
      </Box>

      {registros.length === 0 ? (
        <Alert severity="info">
          Você ainda não possui registros de atendimentos. Os registros aparecerão aqui após cada sessão de atendimento.
        </Alert>
      ) : (
        <Stack spacing={3}>
          {/* Campo de busca */}
          <TextField
            fullWidth
            placeholder={`Buscar por ${isCuidador ? 'cliente' : 'cuidador'}, medicamentos, observações...`}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <Alert severity="info" icon={<Assignment />}>
            <Typography variant="body2">
              <strong>Total:</strong> {registrosFiltrados.length} registro(s) • {Object.keys(registrosAgrupados).length} {isCuidador ? 'cliente(s)' : 'cuidador(es)'}
            </Typography>
          </Alert>

          {Object.entries(registrosAgrupados).map(([id, { nome, registros: registrosPessoa }]) => (
            <Card
              key={id}
              sx={{
                borderRadius: 4,
                border: '1px solid rgba(15, 118, 110, 0.08)',
                backgroundColor: '#ffffff',
                boxShadow: '0 6px 24px rgba(15, 23, 42, 0.02)',
                overflow: 'hidden',
                mb: 3
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        background: '#1565C0',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                      }}
                    >
                      {nome.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {isCuidador ? 'Cliente' : 'Cuidador'}
                      </Typography>
                      <Typography variant="h6" fontWeight="700" sx={{ color: '#1e293b', lineHeight: 1.2 }}>
                        {nome}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={`${registrosPessoa.length} registro${registrosPessoa.length > 1 ? 's' : ''}`}
                    size="small"
                    sx={{
                      fontWeight: 'bold',
                      bgcolor: '#ecfdf5',
                      color: '#1565C0',
                      border: '1px solid #bbf7d0',
                      fontSize: '0.75rem',
                    }}
                  />
                </Stack>

                <Stack spacing={2}>
                  {registrosPessoa.map((registro, index) => (
                    <Accordion
                      key={registro.id}
                      defaultExpanded={index === 0}
                      elevation={0}
                      sx={{
                        border: '1px solid #f1f5f9',
                        borderRadius: '12px !important',
                        mb: 2,
                        overflow: 'hidden',
                        '&::before': { display: 'none' },
                        '&.Mui-expanded': {
                          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                          borderColor: '#e2e8f0',
                        }
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: '#0f766e' }} />}
                        sx={{
                          backgroundColor: '#f8fafc',
                          borderBottom: '1px solid transparent',
                          transition: 'all 0.2s',
                          '&.Mui-expanded': {
                            backgroundColor: '#ffffff',
                            borderBottom: '1px solid #f1f5f9',
                          },
                          px: 2.5
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', flexWrap: 'wrap', gap: 1.5 }}>
                          <CalendarToday fontSize="small" sx={{ color: '#1565C0' }} />
                          <Typography variant="body2" fontWeight="600" sx={{ color: '#334155' }}>
                            {formatarData(registro.dataHoraRegistro)}
                          </Typography>
                          {!isCuidador && (
                            <Tooltip title="Cuidador responsável">
                              <Chip
                                icon={<LocalHospital sx={{ fontSize: '0.875rem' }} />}
                                label={registro.cuidadorNome}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.72rem',
                                  fontWeight: '500',
                                  borderColor: '#cbd5e1',
                                  color: '#475569',
                                  '& .MuiChip-icon': { color: '#64748b' }
                                }}
                              />
                            </Tooltip>
                          )}
                          {isCuidador && (
                            <Tooltip title="Cliente atendido">
                              <Chip
                                icon={<Person sx={{ fontSize: '0.875rem' }} />}
                                label={registro.clienteNome}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.72rem',
                                  fontWeight: '500',
                                  borderColor: '#cbd5e1',
                                  color: '#475569',
                                  '& .MuiChip-icon': { color: '#64748b' }
                                }}
                              />
                            </Tooltip>
                          )}
                          {registro.intercorrencias && (
                            <Chip
                              icon={<Warning sx={{ fontSize: '0.875rem' }} />}
                              label="Intercorrências"
                              size="small"
                              sx={{
                                fontSize: '0.72rem',
                                fontWeight: 'bold',
                                bgcolor: '#fff7ed',
                                color: '#c2410c',
                                border: '1px solid #ffedd5',
                                '& .MuiChip-icon': { color: '#ea580c' }
                              }}
                            />
                          )}
                          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 'bold', bgcolor: '#f1f5f9', px: 1, py: 0.25, borderRadius: 1 }}>
                              REGISTRO #{registro.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </AccordionSummary>

                      <AccordionDetails sx={{ p: 2.5 }}>
                        <Stack spacing={2.5}>
                          {/* Sinais Vitais */}
                          {(registro.pressaoArterial || registro.glicemia || registro.sinaisVitais) && (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                bgcolor: '#fafafa',
                                border: '1px solid #f1f5f9',
                                borderRadius: 2.5,
                                mb: 1
                              }}
                            >
                              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: '700', color: '#1e293b' }}>
                                <MonitorHeart fontSize="small" color="error" />
                                Sinais Vitais
                              </Typography>
                              <Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                {registro.pressaoArterial && (
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                      Pressão Arterial
                                    </Typography>
                                    <Typography variant="body2" fontWeight="700" sx={{ color: '#334155', mt: 0.5 }}>
                                      {registro.pressaoArterial}
                                    </Typography>
                                  </Box>
                                )}
                                {registro.glicemia && (
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                      Glicemia
                                    </Typography>
                                    <Typography variant="body2" fontWeight="700" sx={{ color: '#334155', mt: 0.5 }}>
                                      {registro.glicemia}
                                    </Typography>
                                  </Box>
                                )}
                                {registro.sinaisVitais && (
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                      Outros Sinais
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#475569', mt: 0.5, fontWeight: 500 }}>
                                      {registro.sinaisVitais}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </Paper>
                          )}

                          {/* Medicamentos */}
                          {registro.medicamentosAdministrados &&
                            renderInfoBlock("Medicamentos Administrados", registro.medicamentosAdministrados, <Medication fontSize="small" color="primary" />)
                          }

                          {/* Alimentação */}
                          {registro.alimentacao &&
                            renderInfoBlock("Alimentação", registro.alimentacao, <Restaurant fontSize="small" color="success" />)
                          }

                          {/* Atividades */}
                          {registro.atividadesRealizadas &&
                            renderInfoBlock("Atividades Realizadas", registro.atividadesRealizadas, <DirectionsWalk fontSize="small" color="info" />)
                          }

                          {/* Humor */}
                          {registro.humorEstado &&
                            renderInfoBlock("Humor e Estado Emocional", registro.humorEstado, <MoodOutlined fontSize="small" sx={{ color: '#ea580c' }} />)
                          }

                          {/* Observações Gerais */}
                          {registro.observacoes &&
                            renderInfoBlock("Observações Gerais", registro.observacoes, <LocalHospital fontSize="small" sx={{ color: '#64748b' }} />)
                          }

                          {/* Intercorrências */}
                          {registro.intercorrencias && (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                bgcolor: '#fff7ed',
                                border: '1px solid #ffedd5',
                                borderRadius: 2.5,
                                mb: 1
                              }}
                            >
                              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#c2410c', fontWeight: '700' }}>
                                <Warning fontSize="small" sx={{ color: '#ea580c' }} />
                                Intercorrências
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#9a3412', lineHeight: 1.5, mt: 0.5 }}>
                                {registro.intercorrencias}
                              </Typography>
                            </Paper>
                          )}

                          {/* Metadados */}
                          <Divider />
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', textAlign: 'right', fontWeight: '500' }}>
                            Agendamento #{registro.agendamentoId} • Registrado em {formatarData(registro.dataCriacao)}
                          </Typography>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
