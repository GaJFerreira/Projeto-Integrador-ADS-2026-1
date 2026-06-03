import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Slide, IconButton, Avatar, Paper } from '@mui/material';
import { Close, Chat } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listarContatos } from '../api/mensagens';
import { getUserId, initializeAuthToken } from '../components/auth';

interface PopupMessage {
  id: string; // combination of contactId + timestamp
  contatoId: number;
  nome: string;
  mensagem: string;
  timestamp: string;
}

export function GlobalMessageListener() {
  const navigate = useNavigate();
  const [popups, setPopups] = useState<PopupMessage[]>([]);
  const notifiedMessages = useRef<Set<string>>(new Set());
  // userId como state para reagir à inicialização assíncrona do token
  const [userId, setUserId] = useState<number | null>(null);

  // Inicializa o token JWT e carrega o userId ao montar
  // Sem isso, o polling começa sem Authorization header e retorna 401
  useEffect(() => {
    const init = async () => {
      await initializeAuthToken();
      setUserId(getUserId());
    };
    init();

    // Restaura mensagens já notificadas do sessionStorage
    try {
      const stored = sessionStorage.getItem('carehub_notified_messages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          notifiedMessages.current = new Set(parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading notified messages from sessionStorage', e);
    }
  }, []);

  // Save notified messages to sessionStorage whenever we add one
  const markAsNotified = (popupId: string) => {
    notifiedMessages.current.add(popupId);
    try {
      sessionStorage.setItem('carehub_notified_messages', JSON.stringify(Array.from(notifiedMessages.current)));
    } catch (e) {
      // ignore
    }
  };

  // Use the same query as ChatPage to share cache and avoid duplicate requests!
  const { data: contatos = [] } = useQuery({
    queryKey: ['contatos', userId],
    queryFn: () => listarContatos(),
    enabled: !!userId,
    refetchInterval: 10000, // Polling a cada 10s
    refetchOnWindowFocus: true,
  });

  // Rastreia o último contador de não lidas por contato para detectar AUMENTOS
  const lastUnreadCounts = useRef<Record<number, number>>({});
  // Flag para o primeiro ciclo de polling (não disparar popups para mensagens já existentes)
  const isInitialLoad = useRef<boolean>(true);

  useEffect(() => {
    if (!contatos.length) return;

    const newPopups: PopupMessage[] = [];

    contatos.forEach((contato) => {
      const currentUnread = contato.mensagensNaoLidas || 0;
      const lastKnown = lastUnreadCounts.current[contato.id] ?? 0;

      if (isInitialLoad.current) {
        // Primeira rodada: apenas registra o estado atual sem disparar popups
        lastUnreadCounts.current[contato.id] = currentUnread;
        return;
      }

      // Dispara popup somente se TODAS as condições forem verdadeiras:
      //
      //   1. O contador de não lidas AUMENTOU em relação ao último ciclo
      //   2. Existe preview e data da última mensagem
      //   3. A última mensagem NÃO foi enviada pelo usuário logado.
      //
      // Usamos o campo booleano `ultimaMensagemEnviadaPorMim` calculado pelo backend
      // com IDs locais (sempre consistentes), eliminando qualquer risco de mismatch
      // entre platformUserId e localId que causava falsos positivos no frontend.
      //
      //   true  → eu enviei a última msg → sem popup
      //   false → o contato enviou       → popup
      //   null/undefined → desconhecido  → permite popup (comportamento permissivo)
      const euEnvieiAUltima = contato.ultimaMensagemEnviadaPorMim === true;

      if (
        currentUnread > lastKnown &&
        contato.ultimaMensagem &&
        contato.dataUltimaMensagem &&
        !euEnvieiAUltima   // só dispara se NÃO fui eu quem enviou a última mensagem
      ) {
        const popupId = `msg_${contato.id}_${contato.dataUltimaMensagem}`;

        if (!notifiedMessages.current.has(popupId)) {
          markAsNotified(popupId);
          newPopups.push({
            id: popupId,
            contatoId: contato.id,
            nome: contato.nome,
            mensagem: contato.ultimaMensagem,
            timestamp: contato.dataUltimaMensagem,
          });
        }
      }

      // Atualiza o contador conhecido (inclusive quando decresce — usuário leu)
      lastUnreadCounts.current[contato.id] = currentUnread;
    });

    // Marca o primeiro ciclo como concluído
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (newPopups.length > 0) {
      setPopups((prev) => {
        const updated = [...prev, ...newPopups];
        return updated.slice(-3);
      });

      // Auto-remove popups after 6 seconds
      newPopups.forEach(popup => {
        setTimeout(() => {
          removePopup(popup.id);
        }, 6000);
      });
    }
  }, [contatos]);



  const removePopup = (id: string) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  };

  const handleOpenChat = (contatoId: number, popupId: string) => {
    removePopup(popupId);
    // TODO: Ideally we would pass state to select the contact immediately.
    // For now, redirecting to chat page. The user can select the contact there.
    navigate('/carehub/chat');
  };

  if (!userId) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pointerEvents: 'none', // Let clicks pass through the container
      }}
    >
      {popups.map((popup) => (
        <Slide direction="up" in={true} key={popup.id} mountOnEnter unmountOnExit>
          <Paper
            elevation={6}
            sx={{
              p: 2,
              minWidth: 300,
              maxWidth: 360,
              borderRadius: 3,
              bgcolor: 'background.paper',
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              pointerEvents: 'auto', // Re-enable clicks for the popup itself
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '1rem', fontWeight: 'bold' }}>
                  {popup.nome.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                    {popup.nome}
                  </Typography>
                  <Typography variant="caption" color="primary.main" fontWeight="600">
                    Nova Mensagem
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => removePopup(popup.id)} sx={{ mt: -0.5, mr: -0.5 }}>
                <Close fontSize="small" />
              </IconButton>
            </Box>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.4
              }}
            >
              {popup.mensagem}
            </Typography>

            <Button
              variant="contained"
              size="small"
              startIcon={<Chat fontSize="small" />}
              onClick={() => handleOpenChat(popup.contatoId, popup.id)}
              fullWidth
              sx={{ mt: 0.5, textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
            >
              Abrir Chat
            </Button>
          </Paper>
        </Slide>
      ))}
    </Box>
  );
}
