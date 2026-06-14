import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Save,
  CheckCircle,
  Done,
  Favorite,
  Bloodtype,
  MonitorHeart,
  Medication,
  Restaurant,
  DirectionsWalk,
  EmojiEmotions,
  Description,
  Assignment,
} from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import http from '../libHttp';
import { useSnackbar } from 'notistack';
import { getUserId, isCuidador as isRoleCuidador, checkAndCacheUserType } from '../components/auth';
import { formatDate } from '../utils/dateUtils';

interface Agendamento {
  id: number;
  clienteNome: string;
  dataHoraInicio: string;
  status: string;
}

export function RegistroAcompanhamentoPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [ehCuidador, setEhCuidador] = useState<boolean>(false);
  const [registroSalvo, setRegistroSalvo] = useState(false);
  const [dialogFinalizarOpen, setDialogFinalizarOpen] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  const [cuidadorId, setCuidadorId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    pressaoArterial: '',
    glicemia: '',
    medicamentosAdministrados: '',
    alimentacao: '',
    atividadesRealizadas: '',
    observacoes: '',
    intercorrencias: '',
    humorEstado: '',
    sinaisVitais: '',
  });

  // ✅ Captura agendamentoId da URL se vier de "Iniciar Atendimento" e inicializa cache
  useEffect(() => {
    const inicializar = async () => {
      await checkAndCacheUserType();
      setEhCuidador(isRoleCuidador());
      const currentUserId = getUserId();
      setCuidadorId(currentUserId);

      const params = new URLSearchParams(window.location.search);
      const agendamentoId = params.get('agendamentoId');
      if (agendamentoId) {
        setAgendamentoSelecionado(agendamentoId);
      }
    };
    inicializar();
  }, []);

  useEffect(() => {
    if (cuidadorId && ehCuidador) {
      carregarAgendamentos();
    }
  }, [cuidadorId, ehCuidador]);

  const carregarAgendamentos = async () => {
    if (!cuidadorId) return;

    try {
      const response = await http.get(
        `/api/carehub/agendamentos/cuidador/${cuidadorId}`
      );
      // Filtrar apenas agendamentos em andamento (registro deve ser feito durante o atendimento)
      const agendamentosAtivos = (Array.isArray(response.data) ? response.data : (response.data as any)?.content ?? []).filter(
        (ag: Agendamento) => ag.status === 'EM_ANDAMENTO'
      );
      setAgendamentos(agendamentosAtivos);
    } catch {
      enqueueSnackbar('Erro ao carregar agendamentos', { variant: 'error' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setAgendamentoSelecionado(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agendamentoSelecionado) {
      enqueueSnackbar('Selecione um agendamento', { variant: 'warning' });
      return;
    }

    if (!cuidadorId) {
      enqueueSnackbar('Erro: Usuário não autenticado', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);

      const response = await http.post(
        '/api/carehub/registros',
        {
          agendamentoId: parseInt(agendamentoSelecionado),
          ...formData,
        }
      );

      enqueueSnackbar('✅ Registro salvo com sucesso!', { variant: 'success' });
      setRegistroSalvo(true);

      // Abrir diálogo perguntando se deseja finalizar o atendimento
      setDialogFinalizarOpen(true);

    } catch {
      enqueueSnackbar('Erro ao salvar registro', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const finalizarAtendimento = async () => {
    if (!agendamentoSelecionado) return;

    try {
      setFinalizando(true);
      await http.put(
        `/api/carehub/agendamentos/${agendamentoSelecionado}/status?status=CONCLUIDO`
      );

      enqueueSnackbar('✅ Atendimento finalizado com sucesso!', { variant: 'success' });
      setDialogFinalizarOpen(false);

      // Redirecionar para Meus Agendamentos
      navigate('/carehub/cuidador/agendamentos');
    } catch (err: any) {
      console.error('Erro ao finalizar atendimento:', err);
      enqueueSnackbar('Erro ao finalizar atendimento', { variant: 'error' });
    } finally {
      setFinalizando(false);
    }
  };

  const continuarRegistrando = () => {
    setDialogFinalizarOpen(false);
    // Limpar formulário para novo registro ou continuar editando
    setFormData({
      pressaoArterial: '',
      glicemia: '',
      medicamentosAdministrados: '',
      alimentacao: '',
      atividadesRealizadas: '',
      observacoes: '',
      intercorrencias: '',
      humorEstado: '',
      sinaisVitais: '',
    });
    setRegistroSalvo(false);
    carregarAgendamentos();
  };

  return (
    <Box>
      <PageHeader title="Registro de Acompanhamento" backTo="/carehub/cuidador/" />

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>📋 Documentação do Atendimento:</strong> Registre todos os detalhes do atendimento realizado.
        Este registro será adicionado ao histórico do cliente e ficará disponível para consultas futuras.
      </Alert>

      {!ehCuidador && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Acesso restrito: apenas usuários com função de cuidador podem criar registros de acompanhamento. Se você acredita que seu perfil deveria ser cuidador, verifique sua conta ou contacte o administrador.
        </Alert>
      )}

      {ehCuidador && (
        <>
          {agendamentoSelecionado && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <strong>✅ Atendimento em Andamento:</strong> Você está registrando o acompanhamento em tempo real.
              Preencha os dados conforme realiza as atividades.
            </Alert>
          )}

          <Card
            component="form"
            onSubmit={handleSubmit}
            variant="outlined"
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              bgcolor: 'background.paper',
            }}
          >
            {/* Header / Seleção de Agendamento */}
            <Box sx={{ p: { xs: 2.5, md: 3 }, bgcolor: 'rgba(21, 101, 192, 0.02)', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <Assignment fontSize="small" />
                Vincular Agendamento
              </Typography>
              <FormControl fullWidth required variant="outlined">
                <InputLabel id="agendamento-select-label">Selecione o Atendimento em Andamento</InputLabel>
                <Select
                  labelId="agendamento-select-label"
                  value={agendamentoSelecionado}
                  onChange={handleSelectChange}
                  label="Selecione o Atendimento em Andamento"
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: 'background.paper',
                  }}
                >
                  <MenuItem value="">
                    <em>Nenhum selecionado</em>
                  </MenuItem>
                  {agendamentos.map((agendamento) => (
                    <MenuItem key={agendamento.id} value={agendamento.id.toString()}>
                      {agendamento.clienteNome} — {formatDate(agendamento.dataHoraInicio)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack spacing={4}>
                {/* Sinais Vitais */}
                <Box>
                  <Typography variant="subtitle1" color="primary" fontWeight={700} sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <MonitorHeart sx={{ color: 'error.main' }} />
                    Sinais Vitais
                  </Typography>
                  
                  <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} sx={{ mb: 3 }}>
                    <TextField
                      label="Pressão Arterial"
                      name="pressaoArterial"
                      value={formData.pressaoArterial}
                      onChange={handleChange}
                      placeholder="Ex: 120/80 mmHg"
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: <Favorite sx={{ color: 'error.light', mr: 1, fontSize: 20 }} />,
                        sx: { borderRadius: 2.5 }
                      }}
                    />
                    <TextField
                      label="Glicemia"
                      name="glicemia"
                      value={formData.glicemia}
                      onChange={handleChange}
                      placeholder="Ex: 95 mg/dL"
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: <Bloodtype sx={{ color: 'error.light', mr: 1, fontSize: 20 }} />,
                        sx: { borderRadius: 2.5 }
                      }}
                    />
                  </Box>
                  
                  <TextField
                    label="Outros Sinais Vitais"
                    name="sinaisVitais"
                    value={formData.sinaisVitais}
                    onChange={handleChange}
                    placeholder="Ex: Temperatura 36.5°C, FC 72 bpm"
                    fullWidth
                    multiline
                    rows={2}
                    required
                    InputProps={{
                      sx: { borderRadius: 2.5 }
                    }}
                  />
                </Box>

                <Divider />

                {/* Rotina e Cuidados */}
                <Box>
                  <Typography variant="subtitle1" color="primary" fontWeight={700} sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Medication />
                    Rotina e Cuidados Diários
                  </Typography>

                  <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3} sx={{ mb: 3 }}>
                    <TextField
                      label="Medicamentos Administrados"
                      name="medicamentosAdministrados"
                      value={formData.medicamentosAdministrados}
                      onChange={handleChange}
                      placeholder="Descreva os medicamentos e horários (ou 'Nenhum')"
                      fullWidth
                      multiline
                      rows={3}
                      required
                      InputProps={{
                        sx: { borderRadius: 2.5 }
                      }}
                    />
                    <TextField
                      label="Alimentação"
                      name="alimentacao"
                      value={formData.alimentacao}
                      onChange={handleChange}
                      placeholder="Ex: Café da manhã - aceitação boa, Almoço - aceitação regular"
                      fullWidth
                      multiline
                      rows={3}
                      required
                      InputProps={{
                        sx: { borderRadius: 2.5 }
                      }}
                    />
                  </Box>

                  <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                    <TextField
                      label="Atividades Realizadas"
                      name="atividadesRealizadas"
                      value={formData.atividadesRealizadas}
                      onChange={handleChange}
                      placeholder="Ex: Caminhada de 15 minutos, Exercícios de memória, Leitura"
                      fullWidth
                      multiline
                      rows={3}
                      required
                      InputProps={{
                        sx: { borderRadius: 2.5 }
                      }}
                    />
                    <TextField
                      label="Humor e Estado Emocional"
                      name="humorEstado"
                      value={formData.humorEstado}
                      onChange={handleChange}
                      placeholder="Ex: Alegre e comunicativo, Sonolento mas tranquilo"
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: <EmojiEmotions sx={{ color: '#d97706', mr: 1, fontSize: 20 }} />,
                        sx: { borderRadius: 2.5 }
                      }}
                    />
                  </Box>
                </Box>

                <Divider />

                {/* Relatório e Notas */}
                <Box>
                  <Typography variant="subtitle1" color="primary" fontWeight={700} sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Description />
                    Relatório e Intercorrências
                  </Typography>

                  <Stack spacing={3}>
                    <TextField
                      label="Intercorrências (Caso ocorra algo incomum)"
                      name="intercorrencias"
                      value={formData.intercorrencias}
                      onChange={handleChange}
                      placeholder="Ex: Nenhuma, ou descreva se houve quedas, mal-estar, recusa alimentar..."
                      fullWidth
                      multiline
                      rows={3}
                      required
                      InputProps={{
                        sx: { borderRadius: 2.5 }
                      }}
                    />
                    <TextField
                      label="Observações Gerais do Atendimento"
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleChange}
                      placeholder="Ex: Paciente apresentou boa disposição durante todo o atendimento"
                      fullWidth
                      multiline
                      rows={4}
                      required
                      InputProps={{
                        sx: { borderRadius: 2.5 }
                      }}
                    />
                  </Stack>
                </Box>

                <Divider />

                {/* Botões de Ação */}
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    disabled={loading || registroSalvo}
                    sx={{
                      borderRadius: 2.5,
                      py: 1.5,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      boxShadow: '0 4px 12px rgba(21, 101, 192, 0.15)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(21, 101, 192, 0.25)',
                      }
                    }}
                  >
                    {loading ? 'Salvando Registro...' : registroSalvo ? '✓ Registro Salvo' : 'Salvar Registro do Acompanhamento'}
                  </Button>

                  {registroSalvo && (
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      startIcon={<Done />}
                      onClick={() => setDialogFinalizarOpen(true)}
                      sx={{
                        borderRadius: 2.5,
                        py: 1.5,
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)',
                        '&:hover': {
                          boxShadow: '0 6px 20px rgba(46, 125, 50, 0.25)',
                        }
                      }}
                    >
                      ✓ Finalizar Atendimento e Concluir
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </>
      )}

      {/* Dialog de Confirmação para Finalizar Atendimento */}
      <Dialog
        open={dialogFinalizarOpen}
        onClose={() => !finalizando && setDialogFinalizarOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle color="success" />
          Registro Salvo com Sucesso!
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            O registro de acompanhamento foi salvo. Deseja finalizar o atendimento agora?
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Ao finalizar:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>O atendimento será marcado como <strong>Concluído</strong></li>
              <li>O cliente poderá avaliar o atendimento</li>
              <li>O registro ficará disponível no histórico</li>
            </ul>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Se precisar adicionar mais informações ao registro, clique em "Continuar Registrando".
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={continuarRegistrando}
            variant="outlined"
            disabled={finalizando}
          >
            Continuar Registrando
          </Button>
          <Button
            onClick={finalizarAtendimento}
            variant="contained"
            color="success"
            startIcon={<Done />}
            disabled={finalizando}
          >
            {finalizando ? 'Finalizando...' : 'Finalizar Atendimento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
