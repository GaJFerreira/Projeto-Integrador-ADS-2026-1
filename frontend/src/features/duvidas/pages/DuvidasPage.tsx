import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HistoryIcon from '@mui/icons-material/History';
import SendIcon from '@mui/icons-material/Send';
import QuizIcon from '@mui/icons-material/Quiz';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaqSection } from '../components/FaqSection';
import { SugestaoForm } from '../components/SugestaoForm';
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

export default function DuvidasPage() {
  const [aba, setAba] = useState(0);

  const { data: historico, isLoading } = useQuery({
    queryKey: ['sugestoes', 'minhas'],
    queryFn: sugestoesApi.minhas,
    enabled: aba === 2,
  });

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Cabeçalho */}
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <HelpOutlineIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Dúvidas e Sugestões
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Encontre respostas rápidas, envie sugestões ou entre em contato com o suporte.
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Tabs */}
      <Tabs
        value={aba}
        onChange={(_, v) => setAba(v)}
        sx={{ mb: 3 }}
      >
        <Tab icon={<QuizIcon />} iconPosition="start" label="Perguntas Frequentes" />
        <Tab icon={<SendIcon />} iconPosition="start" label="Enviar Mensagem" />
        <Tab icon={<HistoryIcon />} iconPosition="start" label="Meu Histórico" />
      </Tabs>

      {/* Aba 0 — FAQ */}
      {aba === 0 && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Selecione um módulo para ver as dúvidas mais comuns
          </Typography>
          <FaqSection />
        </Paper>
      )}

      {/* Aba 1 — Formulário */}
      {aba === 1 && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Enviar dúvida, sugestão ou contato
          </Typography>
          <SugestaoForm />
        </Paper>
      )}

      {/* Aba 2 — Histórico */}
      {aba === 2 && (
        <Box>
          {isLoading && (
            <Typography color="text.secondary">Carregando histórico...</Typography>
          )}
          {!isLoading && (!historico || historico.length === 0) && (
            <Paper elevation={0} variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">
                Você ainda não enviou nenhuma mensagem.
              </Typography>
            </Paper>
          )}
          <Stack spacing={2}>
            {historico?.map((s) => (
              <Paper
                key={s.id}
                elevation={0}
                variant="outlined"
                sx={{ p: 2.5, borderRadius: 3 }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={tipoLabel[s.tipo]}
                      color={tipoColor[s.tipo]}
                      size="small"
                    />
                    {s.lida && (
                      <Chip label="Lida" size="small" variant="outlined" color="success" />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(s.createdAt).format('DD/MM/YYYY [às] HH:mm')}
                  </Typography>
                </Stack>
                <Typography fontWeight={600} mb={0.5}>
                  {s.assunto}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {s.mensagem}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
