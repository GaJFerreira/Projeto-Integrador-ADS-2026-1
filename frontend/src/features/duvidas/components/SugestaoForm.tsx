import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { sugestoesApi, type SugestaoRequest, type TipoSugestao } from '../api/sugestoes';

const tipoLabels: Record<TipoSugestao, string> = {
  DUVIDA: '❓ Dúvida',
  SUGESTAO: '💡 Sugestão de melhoria',
  CONTATO: '📩 Entrar em contato com o suporte',
};

export function SugestaoForm() {
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState<SugestaoRequest>({
    tipo: 'DUVIDA',
    assunto: '',
    mensagem: '',
  });

  const mutation = useMutation({
    mutationFn: sugestoesApi.enviar,
    onSuccess: () => {
      enqueueSnackbar('Mensagem enviada com sucesso! Obrigado pelo contato.', { variant: 'success' });
      setForm({ tipo: 'DUVIDA', assunto: '', mensagem: '' });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Erro ao enviar mensagem. Tente novamente.';
      enqueueSnackbar(msg, { variant: 'error' });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.assunto.trim() || !form.mensagem.trim()) {
      enqueueSnackbar('Preencha todos os campos antes de enviar.', { variant: 'warning' });
      return;
    }
    mutation.mutate(form);
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2.5}>
        <Typography variant="body2" color="text.secondary">
          Preencha o formulário abaixo para enviar uma dúvida, sugestão de melhoria ou entrar em
          contato com o suporte. Respondemos em até 2 dias úteis.
        </Typography>

        <FormControl fullWidth required>
          <InputLabel id="tipo-label">Tipo</InputLabel>
          <Select
            labelId="tipo-label"
            label="Tipo"
            value={form.tipo}
            onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoSugestao }))}
          >
            {(Object.entries(tipoLabels) as [TipoSugestao, string][]).map(([val, label]) => (
              <MenuItem key={val} value={val}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Assunto"
          value={form.assunto}
          onChange={(e) => setForm((f) => ({ ...f, assunto: e.target.value }))}
          required
          fullWidth
          inputProps={{ maxLength: 200 }}
          helperText={`${form.assunto.length}/200`}
        />

        <TextField
          label="Mensagem"
          value={form.mensagem}
          onChange={(e) => setForm((f) => ({ ...f, mensagem: e.target.value }))}
          required
          fullWidth
          multiline
          minRows={5}
          placeholder="Descreva sua dúvida ou sugestão com o máximo de detalhes possível..."
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          endIcon={<SendIcon />}
          disabled={mutation.isPending}
          sx={{ alignSelf: 'flex-start', px: 4 }}
        >
          {mutation.isPending ? 'Enviando...' : 'Enviar mensagem'}
        </Button>
      </Stack>
    </Box>
  );
}
