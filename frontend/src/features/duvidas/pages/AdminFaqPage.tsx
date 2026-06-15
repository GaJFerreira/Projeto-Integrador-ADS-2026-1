import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { faqsApi, type FaqItem, type CreateFaqPayload } from '../api/faqs';
import { useSnackbar } from 'notistack';

const coresDisponiveis = ['success', 'warning', 'info', 'secondary', 'primary', 'error', 'default'];

export default function AdminFaqPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateFaqPayload>({
    modulo: '',
    cor: 'primary',
    pergunta: '',
    resposta: '',
  });

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['admin', 'faqs'],
    queryFn: faqsApi.listar,
  });

  const mutationSalvar = useMutation({
    mutationFn: (data: CreateFaqPayload) =>
      editingId ? faqsApi.atualizar(editingId, data) : faqsApi.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      enqueueSnackbar('FAQ salvo com sucesso!', { variant: 'success' });
      handleCloseForm();
    },
    onError: () => {
      enqueueSnackbar('Erro ao salvar FAQ', { variant: 'error' });
    },
  });

  const mutationExcluir = useMutation({
    mutationFn: faqsApi.remover,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      enqueueSnackbar('FAQ excluído com sucesso!', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Erro ao excluir FAQ', { variant: 'error' });
    },
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ modulo: '', cor: 'primary', pergunta: '', resposta: '' });
    setOpenForm(true);
  };

  const handleOpenEdit = (faq: FaqItem) => {
    setEditingId(faq.id);
    setForm({
      modulo: faq.modulo,
      cor: faq.cor,
      pergunta: faq.pergunta,
      resposta: faq.resposta,
    });
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.modulo || !form.pergunta || !form.resposta) {
      enqueueSnackbar('Preencha todos os campos', { variant: 'warning' });
      return;
    }
    mutationSalvar.mutate(form);
  };

  return (
    <Container sx={{ py: 3 }} maxWidth="lg">
      <Stack direction="row" alignItems="center" spacing={1} mb={4}>
        <IconButton onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h3" fontWeight={700} sx={{ flex: 1 }}>
          Gerenciar Perguntas Frequentes (FAQ)
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Nova Pergunta
        </Button>
      </Stack>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell>ID</TableCell>
              <TableCell>Módulo</TableCell>
              <TableCell>Pergunta</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} align="center">Carregando...</TableCell>
              </TableRow>
            )}
            {!isLoading && (!faqs || faqs.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} align="center">Nenhum FAQ cadastrado.</TableCell>
              </TableRow>
            )}
            {faqs?.map((faq) => (
              <TableRow key={faq.id}>
                <TableCell>{faq.id}</TableCell>
                <TableCell>
                  <Chip label={faq.modulo} color={faq.cor as any} size="small" />
                </TableCell>
                <TableCell sx={{ maxWidth: 400 }}>
                  <Typography variant="body2" noWrap title={faq.pergunta}>
                    {faq.pergunta}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleOpenEdit(faq)}
                    title="Editar"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja excluir esta pergunta?')) {
                        mutationExcluir.mutate(faq.id);
                      }
                    }}
                    title="Excluir"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Formulário */}
      <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingId ? 'Editar Pergunta' : 'Nova Pergunta'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField
                label="Módulo"
                placeholder="Ex: CareHub, Remember, Atendimento Médico"
                value={form.modulo}
                onChange={(e) => setForm({ ...form, modulo: e.target.value })}
                required
                fullWidth
              />
              <TextField
                select
                label="Cor da Tag"
                value={form.cor}
                onChange={(e) => setForm({ ...form, cor: e.target.value as any })}
                required
                fullWidth
              >
                {coresDisponiveis.map((c) => (
                  <MenuItem key={c} value={c}>
                    <Chip label={`Exemplo: ${c}`} color={c as any} size="small" />
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Pergunta"
                value={form.pergunta}
                onChange={(e) => setForm({ ...form, pergunta: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Resposta"
                value={form.resposta}
                onChange={(e) => setForm({ ...form, resposta: e.target.value })}
                required
                fullWidth
                multiline
                rows={4}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={mutationSalvar.isPending}
            >
              {mutationSalvar.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
