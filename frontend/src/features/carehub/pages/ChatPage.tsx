import { useEffect, useState, useRef } from 'react';
import { mensagensApi } from '../api';
import http from '../libHttp';
import { listarContatos, marcarConversaComoLida, verificarChatAtivo } from '../api/mensagens';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  Divider,
  Badge,
  InputAdornment,
  IconButton,
  Chip
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { PageHeader } from '../components/PageHeader';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';
import { Chat, Send, Person, Search, FilterList, Close, PlayArrow, Pause, ArrowBack } from '@mui/icons-material';
import { Mic } from '@mui/icons-material';
import { getUserId, isCuidador, checkAndCacheUserType } from '../components/auth';
import { parseDate } from '../utils/dateUtils';

// Configurar dayjs para mostrar tempo relativo em português
dayjs.extend(relativeTime);
dayjs.locale('pt-br');

const formatarPerfil = (perfil?: string) => {
  if (!perfil) return '';
  if (perfil.includes('CUIDADOR')) return 'Cuidador';
  if (perfil.includes('CLIENTE') || perfil.includes('USER') || perfil.includes('IDOSO')) return 'Cliente';
  return perfil;
};

export default function ChatPage() {
  // feature-level accessibility styles
  import('../components/carehub-accessibility.css');
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [userId, setUserId] = useState<number | undefined>(undefined);
  // role state removed - use helper isCuidador() when needed
  const [contatoSelecionado, setContatoSelecionado] = useState<number | undefined>(undefined);
  const [texto, setTexto] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<number | null>(null);
  const [pendingRecording, setPendingRecording] = useState<null | { file: File; url: string; duration?: number }>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const [sendingMedia, setSendingMedia] = useState(false);
  const [busca, setBusca] = useState(''); // Campo de busca
  const [filtroNaoLidas, setFiltroNaoLidas] = useState(false); // Filtro de não lidas

  // Carrega o userId do localStorage e verifica tipo de usuário
  useEffect(() => {
    const inicializar = async () => {
      // Primeiro: tentar usar o ID já em cache para não bloquear a UI
      const cachedId = getUserId();
      if (cachedId) {
        setUserId(cachedId); // Ativa a query imediatamente com o valor cacheado
      }

      // Depois: atualizar o cache via API (pode substituir o userId se mudar)
      await checkAndCacheUserType();
      const id = getUserId();
      if (id) {
        setUserId(id);
      } else {
        console.warn('⚠️ No userId found - user may not be logged in');
      }
    };
    inicializar();
  }, []);

  // Busca lista de contatos (pessoas com quem já trocou mensagens)
  const { data: contatos = [], isLoading: loadingContatos } = useQuery({
    queryKey: ['contatos', userId],
    queryFn: () => listarContatos(),
    enabled: !!userId,
    refetchInterval: 10000, // Atualiza a cada 10 segundos
  });

  // Rastreia o último (contato, número de msgs) que foi marcado como lido
  // para não chamar marcarConversaComoLida a cada poll de 5s
  const lastMarkedRef = useRef<{ contatoId: number; count: number } | null>(null);

  // Fetch conversa com polling a cada 5s
  const { data: msgs = [], isLoading, isError } = useQuery({
    queryKey: ['mensagens', userId, contatoSelecionado],
    queryFn: async () => {
      if (!userId || !contatoSelecionado) return [];
      const mensagens = await mensagensApi.conversa(contatoSelecionado);
      return mensagens;
    },
    enabled: !!(userId && contatoSelecionado),
    refetchInterval: 5000, // Auto-refresh a cada 5s
  });

  // Marca mensagens como lidas SOMENTE quando:
  //   a) O usuário abre um novo chat (contatoSelecionado muda)
  //   b) Chegam mensagens novas (msgs.length aumentou)
  // NUNCA nos refetches periódicos de um chat já aberto sem mudanças.
  // Isso impede que o polling do Idoso zere o contador de não lidas do Cuidador
  // (e vice-versa), que era o bug de "leitura cruzada" relatado.
  useEffect(() => {
    if (!userId || !contatoSelecionado || msgs.length === 0) return;

    const last = lastMarkedRef.current;
    const contatoMudou = !last || last.contatoId !== contatoSelecionado;
    const chegouMensagemNova = last && last.contatoId === contatoSelecionado && msgs.length > last.count;

    if (contatoMudou || chegouMensagemNova) {
      lastMarkedRef.current = { contatoId: contatoSelecionado, count: msgs.length };
      marcarConversaComoLida(contatoSelecionado).then(() => {
        queryClient.invalidateQueries({ queryKey: ['contatos', userId] });
        queryClient.invalidateQueries({ queryKey: ['mensagens-nao-lidas', userId] });
      }).catch(() => { /* silencia erros de rede */ });
    }
  }, [contatoSelecionado, msgs.length, userId]);


  // Verifica se o chat está ativo (agendamento em curso) ou encerrado (concluído/cancelado)
  const { data: chatAtivoData } = useQuery({
    queryKey: ['chat-ativo', userId, contatoSelecionado],
    queryFn: () => {
      if (!contatoSelecionado) return { ativo: false };
      return verificarChatAtivo(contatoSelecionado);
    },
    enabled: !!(userId && contatoSelecionado),
    refetchInterval: 10000, // Verifica a cada 10s
  });
  const chatAtivo = chatAtivoData?.ativo ?? true; // Default true para não bloquear antes de carregar

  // Map of messageId -> local object URL for media fetched with auth header
  const [mediaObjectUrls, setMediaObjectUrls] = useState<Record<number, string>>({});
  const mediaObjectUrlsRef = useRef<Record<number, string>>({});

  // Fetch media blobs for messages that contain mediaUrl, using Authorization header via interceptor
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) return;
      for (const m of msgs) {
        if (m.mediaUrl && !mediaObjectUrlsRef.current[m.id]) {
          try {
            // usar axios/http para garantir Authorization header via interceptor
            const res = await http.get(m.mediaUrl, { responseType: 'blob' });
            const blob = res.data as Blob;
            const url = URL.createObjectURL(blob);
            if (cancelled) {
              URL.revokeObjectURL(url);
              break;
            }
            setMediaObjectUrls(prev => {
              const next = { ...prev, [m.id]: url };
              mediaObjectUrlsRef.current = next;
              return next;
            });
          } catch (e) {
            console.warn('Erro ao baixar mídia da mensagem', e);
          }
        }
      }
    })();
    // Do not clear mediaObjectUrls here — clearing state in the effect cleanup
    // caused a re-fetch loop. We only mark cancelled so in-flight fetches stop.
    return () => { cancelled = true; };
  }, [msgs, userId]);

  // keep ref in sync with state
  useEffect(() => {
    mediaObjectUrlsRef.current = mediaObjectUrls;
  }, [mediaObjectUrls]);

  // On unmount revoke all created object URLs and clear state
  useEffect(() => {
    return () => {
      try {
        Object.values(mediaObjectUrlsRef.current).forEach(u => {
          try { URL.revokeObjectURL(u); } catch { /* ignore */ }
        });
      } finally {
        // best-effort clear
        mediaObjectUrlsRef.current = {};
      }
    };
  }, []);

  // Small audio player component (inline)
  function formatTime(seconds: number | undefined | null) {
    if (!seconds && seconds !== 0) return '--';
    const s = Math.floor(seconds || 0);
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function AudioPlayer({ src, inverted = false }: { src: string; inverted?: boolean }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);
    const [current, setCurrent] = useState(0);
    const [duration, setDuration] = useState<number | null>(null);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
      const a = new Audio(src);
      audioRef.current = a;
      const onTime = () => setCurrent(a.currentTime);
      const onPlay = () => setPlaying(true);
      const onPause = () => setPlaying(false);
      const onEnded = () => { setPlaying(false); setCurrent(0); };
      const onLoaded = () => setDuration(a.duration || 0);
      a.addEventListener('timeupdate', onTime);
      a.addEventListener('play', onPlay);
      a.addEventListener('pause', onPause);
      a.addEventListener('ended', onEnded);
      a.addEventListener('loadedmetadata', onLoaded);
      return () => {
        a.pause();
        a.removeEventListener('timeupdate', onTime);
        a.removeEventListener('play', onPlay);
        a.removeEventListener('pause', onPause);
        a.removeEventListener('ended', onEnded);
        a.removeEventListener('loadedmetadata', onLoaded);
        audioRef.current = null;
      };
    }, [src]);

    const toggle = () => {
      const a = audioRef.current;
      if (!a) return;
      if (playing) a.pause(); else a.play();
    };

    const toggleSpeed = () => {
      const rates = [1, 1.5, 2];
      const currentIndex = rates.indexOf(playbackRate);
      const nextRate = rates[(currentIndex + 1) % rates.length];
      setPlaybackRate(nextRate);
      if (audioRef.current) audioRef.current.playbackRate = nextRate;
    };

    const seek = (e: React.MouseEvent<HTMLDivElement>) => {
      const a = audioRef.current;
      if (!a || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      a.currentTime = percent * duration;
    };

    // Gera waveform visual simples (barras aleatórias estilizadas)
    const waveformBars = Array.from({ length: 28 }, (_, i) => {
      const seed = src.charCodeAt(i % src.length) + i;
      const height = 20 + ((seed % 30) / 30) * 80;
      return height;
    });

    const progress = duration ? (current / duration) * 100 : 0;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 240 }}>
        <IconButton
          size="small"
          onClick={toggle}
          sx={{
            bgcolor: inverted ? 'rgba(255,255,255,0.15)' : 'primary.main',
            color: inverted ? 'white' : 'white',
            width: 36,
            height: 36,
            boxShadow: inverted ? 'none' : '0 2px 8px rgba(0,0,0,0.15)',
            '&:hover': {
              bgcolor: inverted ? 'rgba(255,255,255,0.25)' : 'primary.dark',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s'
          }}
        >
          {playing ? <Pause sx={{ fontSize: 20 }} /> : <PlayArrow sx={{ fontSize: 20 }} />}
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Waveform visual estilo WhatsApp */}
          <Box
            onClick={seek}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.4,
              height: 32,
              cursor: 'pointer',
              mb: 0.5,
              '&:hover .waveform-bar': {
                opacity: 0.8
              }
            }}
          >
            {waveformBars.map((height, i) => (
              <Box
                key={i}
                className="waveform-bar"
                sx={{
                  flex: 1,
                  height: `${height}%`,
                  maxHeight: 32,
                  bgcolor: (i / waveformBars.length * 100) < progress
                    ? (inverted ? 'rgba(255,255,255,0.9)' : 'primary.main')
                    : (inverted ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)'),
                  borderRadius: 1,
                  transition: 'all 0.15s',
                  transform: playing && (i / waveformBars.length * 100) < progress ? 'scaleY(1.1)' : 'scaleY(1)'
                }}
              />
            ))}
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              variant="caption"
              sx={{
                fontSize: 11,
                fontWeight: 500,
                color: inverted ? 'rgba(255,255,255,0.85)' : 'text.secondary'
              }}
            >
              {playing ? formatTime(current) : formatTime(duration)}
            </Typography>

            {/* Botão de velocidade estilo WhatsApp */}
            <Chip
              label={`${playbackRate}x`}
              size="small"
              onClick={toggleSpeed}
              sx={{
                height: 18,
                fontSize: 10,
                fontWeight: 'bold',
                bgcolor: inverted ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                color: inverted ? 'white' : 'text.secondary',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: inverted ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)'
                },
                transition: 'all 0.2s'
              }}
            />
          </Stack>
        </Box>
      </Box>
    );
  }

  const enviarMutation = useMutation({
    mutationFn: () => {
      if (!userId || !contatoSelecionado || !texto) throw new Error('Dados incompletos');
      return mensagensApi.enviar({ destinatarioId: contatoSelecionado, conteudo: texto });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mensagens', userId, contatoSelecionado] });
      queryClient.invalidateQueries({ queryKey: ['mensagens-nao-lidas', userId] });
      queryClient.invalidateQueries({ queryKey: ['contatos', userId] });
      setTexto('');
    },
    onError: (error: any) => {
      const msg = error?.message || 'Erro ao enviar mensagem';
      enqueueSnackbar(msg, { variant: 'error' });
    },
  });

  const enviar = () => {
    if (!texto.trim()) {
      enqueueSnackbar('Digite uma mensagem', { variant: 'warning' });
      return;
    }
    enviarMutation.mutate();
  };

  // Upload de mídia (áudio)
  const handleFileUpload = async (file?: File) => {
    if (!userId || !contatoSelecionado || !file) return;
    try {
      return await mensagensApi.uploadMedia(contatoSelecionado, file);
    } catch (err: any) {
      enqueueSnackbar(err?.message || 'Erro ao enviar mídia', { variant: 'error' });
      throw err;
    } finally {
      queryClient.invalidateQueries({ queryKey: ['mensagens', userId, contatoSelecionado] });
      queryClient.invalidateQueries({ queryKey: ['contatos', userId] });
    }
  };

  // Recording handlers (MediaRecorder)
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      enqueueSnackbar('Seu navegador não suporta gravação de áudio.', { variant: 'error' });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        try {
          const blob = new Blob(audioChunksRef.current, { type: audioChunksRef.current[0]?.type || 'audio/webm' });
          const filename = `audio-${Date.now()}.webm`;
          const file = new File([blob], filename, { type: blob.type });
          const url = URL.createObjectURL(blob);

          // compute duration
          let duration: number | undefined = undefined;
          try {
            const audio = new Audio(url);
            await new Promise<void>((res) => {
              audio.addEventListener('loadedmetadata', () => {
                duration = audio.duration;
                res();
              });
              // fallback timeout
              setTimeout(() => res(), 1500);
            });
          } catch (e) {
            // ignore
          }

          setPendingRecording({ file, url, duration });
        } catch (err) {
          console.warn('Erro no onstop do MediaRecorder', err);
        }
        // stop all tracks
        stream.getTracks().forEach(t => t.stop());
        mediaRecorderRef.current = null;
        setIsRecording(false);
        // stop timer
        if (recordingIntervalRef.current) {
          window.clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        setRecordingTime(0);
      };
      mr.start();
      setIsRecording(true);
      setRecordingTime(0);
      // start timer
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch (err: any) {
      enqueueSnackbar('Permissão de microfone negada ou erro ao acessar microfone.', { variant: 'error' });
    }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      mr.stop();
    } else {
      setIsRecording(false);
    }
  };

  const sendPendingRecording = async () => {
    if (!pendingRecording || !userId || !contatoSelecionado) return;
    setSendingMedia(true);
    const tempId = -Date.now();
    const optimistic = {
      id: tempId,
      remetenteId: userId,
      destinatarioId: contatoSelecionado,
      enviadaPeloUsuarioLogado: true,
      mediaUrl: pendingRecording.url,
      conteudo: null,
      dataEnvio: new Date().toISOString()
    };
    setOptimisticMessages(prev => [...prev, optimistic]);
    try {
      await handleFileUpload(pendingRecording.file);
      // remove optimistic message after upload success
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
      setPendingRecording(null);
      // after upload, queries will be invalidated in handleFileUpload
      queryClient.invalidateQueries({ queryKey: ['mensagens', userId, contatoSelecionado] });
    } catch (err: any) {
      enqueueSnackbar(err?.message || 'Erro ao enviar áudio', { variant: 'error' });
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSendingMedia(false);
    }
  };

  const cancelPendingRecording = () => {
    if (pendingRecording) {
      URL.revokeObjectURL(pendingRecording.url);
      setPendingRecording(null);
    }
  };

  // Filtra e ordena contatos
  const contatosFiltrados = contatos
    .filter(contato => {
      // Filtro de busca por nome
      const matchBusca = busca === '' ||
        contato.nome.toLowerCase().includes(busca.toLowerCase());

      // Filtro de mensagens não lidas
      const matchNaoLidas = !filtroNaoLidas ||
        (contato.mensagensNaoLidas && contato.mensagensNaoLidas > 0);

      // Se o usuário logado for cuidador, escondemos outros cuidadores da lista (mostrar apenas clientes)
      const isUserCuidador = isCuidador();
      const perfilLower = (contato.perfil || '').toLowerCase();
      const hideBecauseRole = isUserCuidador ? perfilLower.includes('cuidador') : false;
      return matchBusca && matchNaoLidas && !hideBecauseRole;
    });

  const contatoAtual = contatos.find(c => c.id === contatoSelecionado);

  const mensagemEnviadaPorMim = (mensagem: any) =>
    mensagem.enviadaPeloUsuarioLogado ?? mensagem.remetenteId === userId;

  // Combine server messages with optimistic local messages and sort by date
  const displayMessages = [...(msgs || []), ...optimisticMessages]
    .slice()
    .sort((a, b) => (parseDate(a.dataEnvio)?.getTime() ?? 0) - (parseDate(b.dataEnvio)?.getTime() ?? 0));

  return (
    <Stack gap={{ xs: 1.5, sm: 2, md: 3 }} sx={{ p: { xs: 1, sm: 1.5, md: 2 }, height: '100%' }}>
      {/* Header */}
      <PageHeader
        title="Mensagens"
        subtitle={isCuidador() ? 'Converse com seus clientes' : 'Converse com cuidadores e clientes'}
        backTo="/carehub"
      />

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 1, md: 2 },
        height: { xs: 'calc(100vh - 180px)', sm: 'calc(100vh - 200px)', md: 'calc(100vh - 250px)' },
        minHeight: { xs: 400, sm: 500 }
      }}>
        {/* Lista de Contatos */}
        <Box sx={{
          width: { xs: '100%', md: '320px', lg: '350px' },
          minWidth: { md: '280px' },
          display: { xs: contatoSelecionado ? 'none' : 'flex', md: 'flex' },
          flexDirection: 'column',
          height: { xs: '100%', md: 'auto' },
          maxHeight: { xs: 'none', md: '100%' }
        }}>
          <Paper variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{
              p: { xs: 1.5, sm: 2 },
              bgcolor: 'primary.main',
              color: 'white',
              flexShrink: 0
            }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }, fontWeight: 600 }}>Conversas</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
                {contatosFiltrados.length} {contatosFiltrados.length === 1 ? 'contato' : 'contatos'}
                {filtroNaoLidas && ' não lidas'}
              </Typography>
            </Box>

            {/* Campo de Busca e Filtro */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar contato..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: busca && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setBusca('')}>
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s',
                  }
                }}
              />

              <Chip
                icon={<FilterList sx={{ fontSize: '0.9rem !important' }} />}
                label={filtroNaoLidas ? 'Mostrar todas' : 'Apenas não lidas'}
                onClick={() => setFiltroNaoLidas(!filtroNaoLidas)}
                color={filtroNaoLidas ? 'primary' : 'default'}
                size="small"
                variant={filtroNaoLidas ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 'medium',
                  px: 0.5,
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
              />
            </Box>

            {loadingContatos && (
              <Stack alignItems="center" p={4}>
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary" mt={2}>
                  Carregando conversas...
                </Typography>
              </Stack>
            )}

            {!loadingContatos && contatosFiltrados.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Chat sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  {contatos.length === 0
                    ? 'Nenhuma conversa ainda'
                    : 'Nenhum contato encontrado'}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  {contatos.length === 0
                    ? 'Envie uma mensagem para começar'
                    : 'Tente ajustar os filtros de busca'}
                </Typography>
              </Box>
            )}

            <List sx={{ p: 0, overflow: 'auto', flex: 1 }}>
              {contatosFiltrados.map((contato) => (
                <Box key={contato.id}>
                  <ListItemButton
                    selected={contatoSelecionado === contato.id}
                    onClick={() => setContatoSelecionado(contato.id)}
                    sx={{
                      py: 0.75,
                      px: 2,
                      height: 60,
                      transition: 'all 0.15s',
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.light',
                        }
                      },
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <Badge
                      badgeContent={contato.mensagensNaoLidas || 0}
                      color="error"
                      overlap="circular"
                      invisible={!contato.mensagensNaoLidas || contato.mensagensNaoLidas === 0}
                      sx={{
                        mr: 1.5,
                        '@keyframes pulse': {
                          '0%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.4)' },
                          '70%': { boxShadow: '0 0 0 6px rgba(211, 47, 47, 0)' },
                          '100%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)' }
                        },
                        '& .MuiBadge-badge': {
                          boxShadow: '0 0 0 2px #fff',
                          animation: contato.mensagensNaoLidas ? 'pulse 2s infinite' : 'none'
                        }
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: contatoSelecionado === contato.id ? 'primary.main' : 'primary.light',
                          color: contatoSelecionado === contato.id ? 'primary.contrastText' : 'primary.main',
                          fontWeight: 'bold',
                          width: 36,
                          height: 36,
                          fontSize: '0.9rem'
                        }}
                      >
                        {contato.nome ? contato.nome.charAt(0).toUpperCase() : <Person />}
                      </Avatar>
                    </Badge>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="body1"
                            fontWeight={contato.mensagensNaoLidas ? 700 : 500}
                            color="text.primary"
                            sx={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {contato.nome}
                          </Typography>
                          {contato.dataUltimaMensagem && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 1, whiteSpace: 'nowrap', fontSize: '0.7rem' }}
                            >
                              {(() => {
                                const d = parseDate(contato.dataUltimaMensagem);
                                return d ? dayjs(d).fromNow() : '-';
                              })()}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        contato.ultimaMensagem ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight={contato.mensagensNaoLidas ? 600 : 'normal'}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '0.775rem',
                              mt: 0.25
                            }}
                          >
                            {contato.ultimaMensagem}
                          </Typography>
                        ) : null
                      }
                      primaryTypographyProps={{ component: 'div' }}
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItemButton>
                  <Divider />
                </Box>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Área de Chat */}
        <Box sx={{
          flex: 1,
          display: { xs: contatoSelecionado ? 'flex' : 'none', md: 'flex' },
          flexDirection: 'column',
          minWidth: 0,
          height: { xs: '100%', md: 'auto' },
          overflow: 'hidden'
        }}>
          <Stack sx={{ height: '100%', overflow: 'hidden' }} gap={{ xs: 1, sm: 1.5, md: 2 }}>
            {!contatoSelecionado && (
              <Card
                variant="outlined"
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderStyle: 'dashed'
                }}
              >
                <Box sx={{ textAlign: 'center', p: 4 }}>
                  <Chat sx={{ fontSize: 72, color: 'primary.main', opacity: 0.3, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Selecione uma conversa
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Escolha um contato na lista ao lado para começar
                  </Typography>
                </Box>
              </Card>
            )}

            {contatoSelecionado && (
              <>
                {/* Header da Conversa */}
                <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, flexShrink: 0, borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                  <Stack direction="row" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                    <IconButton
                      onClick={() => setContatoSelecionado(undefined)}
                      sx={{
                        display: { xs: 'flex', md: 'none' },
                        p: 0.5,
                        mr: 0.5
                      }}
                      color="primary"
                    >
                      <ArrowBack fontSize="small" />
                    </IconButton>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        fontWeight: 'bold',
                        width: { xs: 38, sm: 44 },
                        height: { xs: 38, sm: 44 },
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        fontSize: { xs: '0.95rem', sm: '1.1rem' }
                      }}
                    >
                      {contatoAtual?.nome ? contatoAtual.nome.charAt(0).toUpperCase() : <Person />}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.2rem' },
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {contatoAtual?.nome}
                        </Typography>
                        {contatoAtual?.perfil && (
                          <Chip
                            label={formatarPerfil(contatoAtual.perfil)}
                            size="small"
                            color={contatoAtual.perfil.includes('CUIDADOR') ? 'primary' : 'secondary'}
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              textTransform: 'uppercase'
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>

                {/* Loading */}
                {isLoading && (
                  <Stack alignItems="center" flex={1} justifyContent="center">
                    <CircularProgress size={48} />
                    <Typography variant="body2" color="text.secondary" mt={2}>
                      Carregando mensagens...
                    </Typography>
                  </Stack>
                )}

                {/* Error */}
                {isError && (
                  <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <CardContent>
                      <Typography>Erro ao carregar mensagens. Verifique sua conexão.</Typography>
                    </CardContent>
                  </Card>
                )}

                {/* Empty */}
                {!isLoading && msgs.length === 0 && (
                  <Card
                    variant="outlined"
                    sx={{
                      py: 8,
                      textAlign: 'center',
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderStyle: 'dashed',
                      bgcolor: 'background.default'
                    }}
                  >
                    <Box>
                      <Chat sx={{ fontSize: 72, color: 'primary.main', opacity: 0.3, mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Nenhuma mensagem ainda
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Inicie a conversa enviando uma mensagem abaixo!
                      </Typography>
                    </Box>
                  </Card>
                )}

                {/* Chat area */}
                {!isLoading && msgs.length > 0 && (
                  <Paper
                    variant="outlined"
                    sx={{
                      flex: 1,
                      overflowY: 'auto',
                      p: { xs: 1, sm: 1.5, md: 2 },
                      display: 'flex',
                      flexDirection: 'column',
                      gap: { xs: 1, sm: 1.5 },
                      bgcolor: 'grey.50',
                      backgroundImage: 'linear-gradient(to bottom, transparent 95%, rgba(0,0,0,0.02) 100%)',
                      borderRadius: 2,
                      minHeight: 0
                    }}
                  >
                    {displayMessages.map(m => {
                      const enviadaPorMim = mensagemEnviadaPorMim(m);

                      return (
                        <Box
                          key={m.id}
                          sx={{
                            alignSelf: enviadaPorMim ? 'flex-end' : 'flex-start',
                            maxWidth: { xs: '85%', sm: '75%', md: '70%' },
                            animation: 'fadeIn 0.3s ease-in'
                          }}
                        >
                          <Paper
                            elevation={1}
                            sx={{
                              background: enviadaPorMim
                                ? '#1565C0'
                                : 'white',
                              color: enviadaPorMim ? 'white' : 'text.primary',
                              p: 1.5,
                              borderRadius: 2,
                              borderBottomRightRadius: enviadaPorMim ? 4 : 16,
                              borderBottomLeftRadius: enviadaPorMim ? 16 : 4,
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                              }
                            }}
                          >
                            {m.mediaUrl ? (
                              (() => {
                                const mediaSrc = m.id < 0 ? m.mediaUrl : mediaObjectUrls[m.id];
                                return mediaSrc ? (
                                  <AudioPlayer src={mediaSrc} inverted={enviadaPorMim} />
                                ) : (
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
                                    <CircularProgress size={16} sx={{ color: enviadaPorMim ? 'rgba(255,255,255,0.7)' : 'primary.main' }} />
                                    <Typography variant="caption" sx={{ fontSize: 11, opacity: 0.8 }}>Carregando áudio...</Typography>
                                  </Stack>
                                );
                              })()
                            ) : (
                              m.conteudo && (
                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                  {m.conteudo}
                                </Typography>
                              )
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              {m.id < 0 && <CircularProgress size={14} color="inherit" />}
                              <Typography
                                variant="caption"
                                sx={{
                                  opacity: 0.7,
                                  fontSize: 10
                                }}
                              >
                                {(() => {
                                  const d = parseDate(m.dataEnvio);
                                  return d ? dayjs(d).format('DD/MM HH:mm') : 'Data não informada';
                                })()}
                              </Typography>
                            </Box>
                          </Paper>
                        </Box>
                      )
                    })}
                  </Paper>
                )}

                {/* Input — bloqueado quando chat não está ativo */}
                {!chatAtivo ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      flexShrink: 0,
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(102,126,234,0.06) 0%, rgba(118,75,162,0.06) 100%)',
                      border: '1.5px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'action.selected',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Chat sx={{ fontSize: 20, color: 'text.disabled' }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        Chat encerrado
                      </Typography>
                      <Typography variant="caption" color="text.disabled" display="block">
                        O agendamento foi concluído. Não é mais possível enviar mensagens.
                      </Typography>
                    </Box>
                  </Paper>
                ) : (
                  <Card variant="outlined" sx={{ boxShadow: '0 -4px 12px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                    <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1, sm: 1.5, md: 2 } } }}>
                      {/* Pending recording preview - layout responsivo */}
                      {pendingRecording && (
                        <Paper
                          elevation={0}
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'stretch', sm: 'center' },
                            gap: { xs: 1, sm: 2 },
                            mb: 1.5,
                            p: { xs: 1, sm: 1.25 },
                            borderRadius: 2,
                            bgcolor: 'grey.100'
                          }}
                        >
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <AudioPlayer src={pendingRecording.url} />
                            <Typography variant="caption" color="text.secondary">
                              {pendingRecording.duration ? formatTime(pendingRecording.duration) : `${recordingTime}s`}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-end', sm: 'flex-start' }}>
                            <Button size="small" variant="contained" onClick={sendPendingRecording} disabled={sendingMedia}>
                              {sendingMedia ? 'Enviando...' : 'Enviar'}
                            </Button>
                            <Button size="small" variant="text" onClick={cancelPendingRecording}>
                              Cancelar
                            </Button>
                          </Stack>
                        </Paper>
                      )}

                      <Stack direction="row" gap={{ xs: 0.5, sm: 1 }} alignItems="flex-end" flexWrap="nowrap">
                        <TextField
                          fullWidth
                          size="small"
                          value={texto}
                          onChange={(e) => setTexto(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              enviar();
                            }
                          }}
                          multiline
                          maxRows={3}
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            },
                            '& .MuiInputBase-input': {
                              p: { xs: '8px 12px', sm: '8.5px 14px' }
                            }
                          }}
                        />
                        {/* Botões de ação */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 0.5 }, flexShrink: 0 }}>
                          <IconButton
                            title={isRecording ? 'Parar gravação' : 'Gravar áudio'}
                            color={isRecording ? 'error' : 'default'}
                            onClick={() => {
                              if (isRecording) stopRecording(); else startRecording();
                            }}
                            size="small"
                            sx={{ p: { xs: 0.75, sm: 1 } }}
                          >
                            <Mic sx={{ fontSize: { xs: 20, sm: 24 } }} />
                          </IconButton>
                          {isRecording && (
                            <Chip
                              label={`${recordingTime}s`}
                              size="small"
                              color="error"
                              sx={{ display: { xs: 'none', sm: 'flex' } }}
                            />
                          )}
                        </Box>
                        <Button
                          variant="contained"
                          onClick={enviar}
                          disabled={enviarMutation.isPending || !texto.trim()}
                          endIcon={<Send sx={{ fontSize: { xs: 16, sm: 20 }, display: { xs: 'none', sm: 'block' } }} />}
                          sx={{
                            minWidth: { xs: 'auto', sm: 100, md: 110 },
                            borderRadius: 2,
                            py: { xs: 0.8, sm: 1, md: 1.2 },
                            px: { xs: 1.5, sm: 2, md: 2.5 },
                            textTransform: 'none',
                            fontWeight: 'bold',
                            fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9375rem' },
                            flexShrink: 0
                          }}
                        >
                          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Enviar</Box>
                          <Send sx={{ fontSize: 18, display: { xs: 'block', sm: 'none' } }} />
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}
