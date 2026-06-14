import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { sugestoesApi, type TipoSugestao } from '../api/sugestoes';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const tipoColor: Record<TipoSugestao, 'info' | 'success' | 'warning'> = {
  DUVIDA: 'info',
  SUGESTAO: 'success',
  CONTATO: 'warning',
};

const tipoLabel: Record<TipoSugestao, string> = {
  DUVIDA: 'Dúvida',
  SUGESTAO: 'Sugestão',
  CONTATO: 'Contato',
};

export default function AdminDuvidasPage() {
  const [aba, setAba] = useState<'todas' | 'nao-lidas'>('todas');
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'sugestoes'],
    queryFn: sugestoesApi.listarTodas,
  });

  const mutationLida = useMutation({
    mutationFn: (id: number) => sugestoesApi.marcarComoLida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sugestoes'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sugestoes-count'] });
      enqueueSnackbar('Marcada como lida.', { variant: 'success' });
    },
  });

  const mutationDeletar = useMutation({
    mutationFn: (id: number) => sugestoesApi.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sugestoes'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sugestoes-count'] });
      enqueueSnackbar('Mensagem removida.', { variant: 'info' });
    },
  });

  const lista = (data ?? []).filter((s) =>
    aba === 'todas' ? true : !s.lida
  );
  const totalNaoLidas = (data ?? []).filter((s) => !s.lida).length;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <InboxIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Central de Mensagens
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dúvidas e sugestões enviadas pelos usuários da plataforma.
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 3 }}>
        <Tab
          value="todas"
          icon={<InboxIcon />}
          iconPosition="start"
          label={`Todas (${data?.length ?? 0})`}
        />
        <Tab
          value="nao-lidas"
          icon={<DraftsIcon />}
          iconPosition="start"
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <span>Não lidas</span>
              {totalNaoLidas > 0 && (
                <Chip
                  label={totalNaoLidas}
                  color="error"
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Stack>
          }
        />
      </Tabs>

      {isLoading && <Typography color="text.secondary">Carregando mensagens...</Typography>}

      {!isLoading && lista.length === 0 && (
        <Paper elevation={0} variant="outlined" sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
          <InboxIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">
            {aba === 'nao-lidas' ? 'Nenhuma mensagem não lida.' : 'Nenhuma mensagem recebida ainda.'}
          </Typography>
        </Paper>
      )}

      <Stack spacing={2}>
        {lista.map((s) => (
          <Paper
            key={s.id}
            elevation={0}
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              borderColor: s.lida ? 'divider' : 'primary.main',
              bgcolor: s.lida ? 'transparent' : 'primary.50',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip label={tipoLabel[s.tipo]} color={tipoColor[s.tipo]} size="small" />
                {!s.lida && <Chip label="Nova" color="error" size="small" />}
              </Stack>
              <Stack direction="row" spacing={0.5}>
                {!s.lida && (
                  <Tooltip title="Marcar como lida">
                    <IconButton
                      size="small"
                      onClick={() => mutationLida.mutate(s.id)}
                      disabled={mutationLida.isPending}
                    >
                      <MarkEmailReadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Remover">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => mutationDeletar.mutate(s.id)}
                    disabled={mutationDeletar.isPending}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <Typography fontWeight={700} mb={0.5}>
              {s.assunto}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 1.5 }}>
              {s.mensagem}
            </Typography>

            <Divider sx={{ mb: 1.5 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                De: <strong>{s.userName}</strong> — {s.userEmail}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dayjs(s.createdAt).format('DD/MM/YYYY [às] HH:mm')}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
