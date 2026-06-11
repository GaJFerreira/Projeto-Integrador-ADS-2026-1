import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Divider,
  TextField,
  Button,
  Avatar,
} from '@mui/material';
import {
  ExpandMore,
  Person,
  CalendarToday,
  LocalHospital,
  Medication,
  Warning,
  Bloodtype,
  Phone,
  Add,
  FolderOpen,
  AccessibilityNew,
  Note,
} from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import http from '../libHttp';
import { isCuidador as isRoleCuidador, checkAndCacheUserType } from '../components/auth';
import { parseDate, formatDate } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

interface Prontuario {
  id: number;
  clienteId: number;
  clienteNome: string;
  dataNascimento?: string | null;
  historicoMedico?: string;
  medicamentosUso?: string;
  alergias?: string;
  tipoSanguineo?: string;
  contatoEmergencia?: string;
  observacoesGerais?: string;
  necessidadesEspeciais?: string;
}

interface ClienteComProntuario {
  clienteId: number;
  clienteNome: string;
  agendamentoId: number;
  prontuario: Prontuario | null;
  temProntuario: boolean;
}

interface Agendamento {
  id: number;
  clienteId: number;
  clienteNome: string;
}

export function ProntuariosClientesPage() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<ClienteComProntuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCuidador, setIsCuidador] = useState(false);
  const [cuidadorId, setCuidadorId] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const verificarECarregar = async () => {
      await checkAndCacheUserType();
      const ehCuidador = isRoleCuidador();
      setIsCuidador(ehCuidador);

      try {
        const perfilResp = await http.get('/api/carehub/perfil');
        const perfil = perfilResp.data;
        const logs: string[] = [];
        logs.push(`Perfil obtido: id=${perfil?.id}, platformUserId=${perfil?.platformUserId}, role=${perfil?.role}`);

        if (perfil?.platformUserId) {
          setCuidadorId(perfil.platformUserId);
          logs.push(`CuidadorId definido como platformUserId=${perfil.platformUserId}`);
        } else if (perfil?.id) {
          setCuidadorId(perfil.id);
          logs.push(`CuidadorId definido como localId=${perfil.id} (platformUserId ausente!)`);
        }
        setDebugInfo(logs);
      } catch (err: any) {
        setDebugInfo([`Erro ao obter perfil: ${err?.message}`]);
      }

      setAuthChecked(true);
    };

    verificarECarregar();
  }, []);

  useEffect(() => {
    if (cuidadorId && isCuidador) {
      carregarClientes();
    } else if (authChecked) {
      setLoading(false);
    }
  }, [cuidadorId, isCuidador, authChecked]);

  const carregarClientes = async () => {
    if (!cuidadorId) return;

    try {
      setLoading(true);
      const logs = [...debugInfo];
      logs.push(`Buscando agendamentos do cuidador=${cuidadorId}...`);

      // 1. Buscar agendamentos do cuidador logado
      const agendamentosResponse = await http.get(`/api/carehub/agendamentos/cuidador/${cuidadorId}`);
      const agendamentos: Agendamento[] = agendamentosResponse.data || [];
      logs.push(`Agendamentos encontrados: ${agendamentos.length}`);
      agendamentos.forEach(ag => {
        logs.push(`  -> agendamento.id=${ag.id}, clienteId=${ag.clienteId}, clienteNome=${ag.clienteNome}`);
      });

      if (agendamentos.length === 0) {
        setClientes([]);
        setError('Você ainda não possui agendamentos com clientes.');
        setDebugInfo(logs);
        setLoading(false);
        return;
      }

      // 2. Deduplificar clientes por clienteId
      const clientesMap = new Map<number, { clienteId: number; clienteNome: string; agendamentoId: number }>();
      for (const ag of agendamentos) {
        if (!clientesMap.has(ag.clienteId)) {
          clientesMap.set(ag.clienteId, {
            clienteId: ag.clienteId,
            clienteNome: ag.clienteNome,
            agendamentoId: ag.id,
          });
        }
      }

      logs.push(`Clientes únicos: ${clientesMap.size}`);

      // 3. Buscar prontuário de cada cliente individualmente
      const clientesComProntuario: ClienteComProntuario[] = [];

      for (const [clienteId, clienteInfo] of clientesMap) {
        logs.push(`Buscando prontuário para clienteId=${clienteId} (${clienteInfo.clienteNome})...`);
        try {
          const prontuarioResponse = await http.get(`/api/carehub/prontuarios/cliente/${clienteId}`);

          if (prontuarioResponse.status === 204 || !prontuarioResponse.data) {
            logs.push(`  -> 204/sem dados para clienteId=${clienteId}. Cliente sem prontuário.`);
            clientesComProntuario.push({
              ...clienteInfo,
              prontuario: null,
              temProntuario: false,
            });
          } else {
            logs.push(`  -> Prontuário encontrado: id=${prontuarioResponse.data?.id}`);
            clientesComProntuario.push({
              ...clienteInfo,
              prontuario: prontuarioResponse.data,
              temProntuario: true,
            });
          }
        } catch (err: any) {
          const status = err?.response?.status || err?.status;
          logs.push(`  -> Erro HTTP ${status} para clienteId=${clienteId}: ${err?.message}`);
          clientesComProntuario.push({
            ...clienteInfo,
            prontuario: null,
            temProntuario: false,
          });
        }
      }

      setClientes(clientesComProntuario);
      setDebugInfo(logs);
      setError(null);
    } catch (err: any) {
      setError(`Erro ao carregar dados: ${err?.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const calcularIdade = (dataNascimento?: string | null) => {
    const nascimento = parseDate(dataNascimento);
    if (!nascimento) return null;
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const formatarIdade = (dataNascimento?: string | null) => {
    const idade = calcularIdade(dataNascimento);
    return idade === null ? 'Idade N/I' : `${idade} anos`;
  };

  const formatarData = (dataISO?: string | null) => formatDate(dataISO, 'Data N/I');

  if (authChecked && !isCuidador) {
    return (
      <Box>
        <PageHeader title="Prontuários dos Idosos" />
        <Alert severity="warning">
          Esta página é acessível apenas para cuidadores. Faça login com uma conta de cuidador para visualizar os prontuários dos seus clientes.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box>
        <PageHeader title="Prontuários dos Clientes" />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // Filtrar pela pesquisa (exibe tanto os com prontuário quanto os sem)
  const clientesFiltrados = clientes.filter(c => {
    if (!searchTerm) return true;
    const termo = searchTerm.toLowerCase();
    return (
      c.clienteNome.toLowerCase().includes(termo) ||
      c.prontuario?.tipoSanguineo?.toLowerCase().includes(termo) ||
      c.prontuario?.historicoMedico?.toLowerCase().includes(termo) ||
      c.prontuario?.medicamentosUso?.toLowerCase().includes(termo) ||
      c.prontuario?.alergias?.toLowerCase().includes(termo)
    );
  });

  return (
    <Box>
      <PageHeader title="Prontuários dos Clientes" />

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Atenção:</strong> Informações sensíveis. Mantenha a confidencialidade dos dados médicos.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Campo de Pesquisa */}
      {clientes.length > 0 && (
        <TextField
          fullWidth
          placeholder="Pesquisar por nome do cliente, tipo sanguíneo, histórico, medicamentos ou alergias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      )}

      {clientesFiltrados.length === 0 ? (
        <Alert severity="info" icon={<FolderOpen />}>
          {searchTerm
            ? 'Nenhum cliente encontrado com o termo de busca.'
            : 'Nenhum cliente encontrado nos seus agendamentos. Confirme um agendamento para visualizar prontuários.'}
        </Alert>
      ) : (
        <Stack spacing={2}>
          {clientesFiltrados.map((c) => (
            <Accordion key={c.clienteId} elevation={3} sx={{ borderRadius: 2, '&:before': { display: 'none' }, overflow: 'hidden' }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <Person />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {c.clienteNome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {c.temProntuario
                        ? `${formatarIdade(c.prontuario!.dataNascimento)} • ${c.prontuario!.tipoSanguineo || 'Sangue N/I'}`
                        : 'Prontuário ainda não cadastrado'}
                    </Typography>
                  </Box>
                  <Chip
                    label={c.temProntuario ? 'Prontuário Ativo' : 'Sem Prontuário'}
                    color={c.temProntuario ? 'primary' : 'default'}
                    variant={c.temProntuario ? 'filled' : 'outlined'}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ bgcolor: '#fafafa', p: 3 }}>
                {!c.temProntuario ? (
                  <Box textAlign="center" py={4} sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                    <FolderOpen sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                    <Typography variant="body1" color="text.secondary" mb={2}>
                      Este cliente ainda não possui informações médicas registradas.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate(`/carehub/prontuario/${c.clienteId}`)}
                      sx={{ borderRadius: 2 }}
                    >
                      Criar Prontuário Médico
                    </Button>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {/* Dados Básicos */}
                    <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle1" color="primary" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" />
                        Dados Básicos
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Data de Nascimento</Typography>
                          <Typography variant="body2" fontWeight="medium">{formatarData(c.prontuario!.dataNascimento)}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Idade</Typography>
                          <Typography variant="body2" fontWeight="medium">{formatarIdade(c.prontuario!.dataNascimento)}</Typography>
                        </Box>
                        {c.prontuario!.tipoSanguineo && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Bloodtype fontSize="small" color="error" />
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">Tipo Sanguíneo</Typography>
                              <Typography variant="body2" fontWeight="medium">{c.prontuario!.tipoSanguineo}</Typography>
                            </Box>
                          </Box>
                        )}
                      </Stack>
                    </Box>

                    {/* Histórico Médico e Medicamentos */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                      {c.prontuario!.historicoMedico && (
                        <Box sx={{ flex: 1, bgcolor: 'background.paper', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle1" color="primary" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalHospital fontSize="small" />
                            Histórico Médico
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
                            {c.prontuario!.historicoMedico}
                          </Typography>
                        </Box>
                      )}

                      {c.prontuario!.medicamentosUso && (
                        <Box sx={{ flex: 1, bgcolor: 'background.paper', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle1" color="primary" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Medication fontSize="small" />
                            Medicamentos em Uso
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
                            {c.prontuario!.medicamentosUso}
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    {/* Alergias */}
                    {c.prontuario!.alergias && (
                      <Alert severity="error" icon={<Warning />} sx={{ borderRadius: 2 }}>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
                          Alergias Severas
                        </Typography>
                        <Typography variant="body2">{c.prontuario!.alergias}</Typography>
                      </Alert>
                    )}

                    {/* Contato, Necessidades e Observações */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                      {c.prontuario!.contatoEmergencia && (
                        <Box sx={{ flex: 1, bgcolor: 'background.paper', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle1" color="primary" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Phone fontSize="small" />
                            Contato de Emergência
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body2" fontWeight="medium">{c.prontuario!.contatoEmergencia}</Typography>
                        </Box>
                      )}

                      {c.prontuario!.necessidadesEspeciais && (
                        <Box sx={{ flex: 1, bgcolor: 'background.paper', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle1" color="primary" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessibilityNew fontSize="small" />
                            Necessidades Especiais
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
                            {c.prontuario!.necessidadesEspeciais}
                          </Typography>
                        </Box>
                      )}

                      {c.prontuario!.observacoesGerais && (
                        <Box sx={{ flex: 1, bgcolor: 'background.paper', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle1" color="primary" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Note fontSize="small" />
                            Observações Gerais
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
                            {c.prontuario!.observacoesGerais}
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    {/* Botão de Editar */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="medium"
                        onClick={() => navigate(`/carehub/prontuario/${c.clienteId}`)}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        Editar Prontuário
                      </Button>
                    </Box>
                  </Stack>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
    </Box>
  );
}
