import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { prontuariosApi } from '../api';
import { verificarPodeEditar } from '../api/prontuarios';
import type { ProntuarioResponseDTO } from '../types';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { PageHeader } from '../components/PageHeader';
import { Save, Lock, CalendarToday, LocalHospital, Phone } from '@mui/icons-material';
import { getUserId, isCliente, checkAndCacheUserType } from '../components/auth';
import Autocomplete from '@mui/material/Autocomplete';

export default function ProntuarioPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { clienteId: clienteIdParam } = useParams<{ clienteId: string }>();
  const [clienteId, setClienteId] = useState<number | undefined>(clienteIdParam ? Number(clienteIdParam) : undefined);
  const [podeEditar, setPodeEditar] = useState(false);
  const [verificandoPermissao, setVerificandoPermissao] = useState(true);
  const [_ehCliente, setEhCliente] = useState<boolean | null>(null);

  // Verificar se é cliente e bloquear acesso (prontuário é para cuidadores)
  useEffect(() => {
    const verificarTipo = async () => {
      await checkAndCacheUserType();
      const cliente = isCliente();
      setEhCliente(cliente);
      if (cliente) {
        enqueueSnackbar('Acesso negado: prontuários são exclusivos para cuidadores', { variant: 'error' });
        navigate('/carehub');
        return;
      }
    };
    verificarTipo();
  }, [navigate, enqueueSnackbar]);

  // Buscar platformUserId do cliente se não veio via URL params
  useEffect(() => {
    if (clienteIdParam) {
      setClienteId(Number(clienteIdParam));
      return;
    }
    // Se nao veio clienteId na URL, nao carregamos prontuario automaticamente
    setClienteId(undefined);
  }, [clienteIdParam]);

  const { data: model, isLoading } = useQuery({
    queryKey: ['prontuario', clienteId],
    queryFn: () => prontuariosApi.porCliente(clienteId!),
    enabled: !!clienteId,
  });

  // Verificar se cuidador pode editar prontuário
  useEffect(() => {
    async function verificarPermissao() {
      if (!clienteId) {
        setVerificandoPermissao(false);
        return;
      }

      const userId = getUserId();
      if (!userId) {
        setPodeEditar(false);
        setVerificandoPermissao(false);
        return;
      }

      const pode = await verificarPodeEditar(clienteId);
      setPodeEditar(pode);
      setVerificandoPermissao(false);
    }

    verificarPermissao();
  }, [clienteId]);

  const [form, setForm] = useState<Partial<ProntuarioResponseDTO>>({});

  useEffect(() => {
    if (model) setForm(model);
  }, [model]);

  const salvarMutation = useMutation({
    mutationFn: async () => {
      if (!clienteId) throw new Error('Cliente não identificado');

      const dto = {
        clienteId,
        dataNascimento: formatarDataParaOInput(form.dataNascimento) || null,
        historicoMedico: form.historicoMedico || '',
        medicamentosUso: form.medicamentosUso || '',
        alergias: form.alergias || '',
        tipoSanguineo: form.tipoSanguineo || '',
        contatoEmergencia: form.contatoEmergencia || '',
        observacoesGerais: form.observacoesGerais || '',
        necessidadesEspeciais: form.necessidadesEspeciais || '',
      };

      if (model?.id) {
        return prontuariosApi.atualizar(model.id, dto);
      } else {
        return prontuariosApi.criar(dto);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prontuario', clienteId] });
      enqueueSnackbar('Prontuário salvo com sucesso!', { variant: 'success' });
      navigate('/carehub/cuidador/prontuarios');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao salvar prontuário';
      enqueueSnackbar(message, { variant: 'error' });
    },
  });

  const updateField = (field: keyof ProntuarioResponseDTO, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const camposDesabilitados = !podeEditar || verificandoPermissao;

  const formatarDataParaOInput = (dataString?: string | null) => {
    if (!dataString) return '';

    if (dataString.includes('-')) {
      return dataString.substring(0, 10);
    }

    if (dataString.includes('/')) {
      const [dia, mes, ano] = dataString.split('/');
      return `${ano}-${mes}-${dia}`;
    }

    return dataString;
  };

  return (
    <Stack gap={3} sx={{ p: 2 }}>
      <PageHeader
        title="Prontuário Médico"
        subtitle="Mantenha as informações de saúde dos clientes atualizadas"
        backTo="/carehub"
      />

      {!podeEditar && !verificandoPermissao && (
        <Alert severity="warning" icon={<Lock />}>
          <Typography variant="body2" fontWeight="medium">
            Modo Somente Leitura
          </Typography>
          <Typography variant="caption" display="block" sx={{ mb: 1 }}>
            Você só pode editar prontuários durante atendimentos agendados para hoje (status CONFIRMADO ou EM_ANDAMENTO).
          </Typography>
          <Box>
            <Button variant="outlined" size="small" onClick={() => navigate('/carehub/meus-agendamentos')}>
              Ver meus agendamentos
            </Button>
          </Box>
        </Alert>
      )}

      {isLoading && (
        <Stack alignItems="center" py={4}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" mt={2}>
            Carregando prontuário...
          </Typography>
        </Stack>
      )}

      {!isLoading && (
        <Card variant="outlined">
          <CardContent>
            <Stack gap={3}>
              {/* Seção 1: Dados Básicos */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday />
                  Dados Básicos
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Data de Nascimento" 
                    type="date"
                    value={formatarDataParaOInput(form?.dataNascimento)}
                    onChange={(e) => updateField('dataNascimento', e.target.value)}
                    disabled={camposDesabilitados}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <Autocomplete
                    options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                    disabled={camposDesabilitados}
                    value={form?.tipoSanguineo || null} // O Autocomplete espera 'null' em vez de '' quando está vazio
                    onChange={(event, newValue) => {
                      // newValue entrega direto a string selecionada (ex: 'A+') ou null se limpar
                      updateField('tipoSanguineo', newValue || '');
                    }}
                    // Define o comportamento de filtro enquanto o usuário digita
                    onInputChange={(event, newInputValue) => {
                      // Caso o usuário apenas digite sem clicar na opção, você também pode atualizar o estado
                      updateField('tipoSanguineo', newInputValue.toUpperCase());
                    }}
                    // Renderiza o input visual usando o estilo do seu TextField original
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tipo Sanguíneo"
                        placeholder="Ex: O+, A-, AB+"
                        fullWidth
                      />
                    )}
                    // Garante que a busca ignore maiúsculas/minúsculas (se digitar 'a', acha 'A+')
                    filterOptions={(options, state) =>
                      options.filter((item) =>
                        item.toLowerCase().includes(state.inputValue.toLowerCase())
                      )
                    }
                  />
                </Box>
              </Box>

              {/* Seção 2: Informações Médicas */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalHospital />
                  Informações Médicas
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack gap={2}>
                  <TextField
                    label="Histórico Médico"
                    value={form?.historicoMedico || ''}
                    onChange={(e) => updateField('historicoMedico', e.target.value)}
                    disabled={camposDesabilitados}
                    multiline
                    minRows={3}
                    placeholder="Descreva histórico de doenças, cirurgias, tratamentos..."
                    fullWidth
                  />

                  <TextField
                    label="Medicamentos em uso"
                    value={form?.medicamentosUso || ''}
                    onChange={(e) => updateField('medicamentosUso', e.target.value)}
                    disabled={camposDesabilitados}
                    multiline
                    minRows={2}
                    placeholder="Liste os medicamentos, dosagens e frequência"
                    fullWidth
                  />

                  <TextField
                    label="Alergias"
                    value={form?.alergias || ''}
                    onChange={(e) => updateField('alergias', e.target.value)}
                    disabled={camposDesabilitados}
                    placeholder="Alergias a medicamentos, alimentos, etc."
                    fullWidth
                    color="warning"
                  />
                </Stack>
              </Box>

              {/* Seção 3: Informações de Contato e Cuidados */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone />
                  Informações de Contato e Cuidados
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack gap={2}>
                  <TextField
                    label="Contato de Emergência"
                    value={form?.contatoEmergencia || ''}
                    onChange={(e) => updateField('contatoEmergencia', e.target.value)}
                    disabled={camposDesabilitados}
                    placeholder="Nome: (XX) XXXXX-XXXX"
                    fullWidth
                  />

                  <TextField
                    label="Necessidades Especiais"
                    value={form?.necessidadesEspeciais || ''}
                    onChange={(e) => updateField('necessidadesEspeciais', e.target.value)}
                    disabled={camposDesabilitados}
                    multiline
                    minRows={2}
                    placeholder="Descreva necessidades especiais de cuidado"
                    fullWidth
                  />

                  <TextField
                    label="Observações Gerais"
                    multiline
                    minRows={3}
                    value={form?.observacoesGerais || ''}
                    onChange={(e) => updateField('observacoesGerais', e.target.value)}
                    disabled={camposDesabilitados}
                    placeholder="Outras informações relevantes"
                    fullWidth
                  />
                </Stack>
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={podeEditar ? <Save /> : <Lock />}
                onClick={() => salvarMutation.mutate()}
                disabled={!podeEditar || salvarMutation.isPending || !clienteId}
                fullWidth
                sx={{ mt: 2, py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
              >
                {salvarMutation.isPending
                  ? 'Salvando...'
                  : !podeEditar
                    ? 'Edição Bloqueada (Sem Agendamento Ativo)'
                    : model?.id
                      ? 'Atualizar Prontuário'
                      : 'Criar Prontuário'
                }
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
