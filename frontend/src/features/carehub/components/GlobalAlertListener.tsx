import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Box, Stack, Card, CardContent, CircularProgress 
} from '@mui/material';
import { NotificationsActive, CheckCircle } from '@mui/icons-material';
import { iotApi } from '../api';
import type { AlertaEmergenciaResponseDTO } from '../types';
import dayjs from 'dayjs';

export function GlobalAlertListener() {
  const [activeAlerts, setActiveAlerts] = useState<AlertaEmergenciaResponseDTO[]>([]);
  const [open, setOpen] = useState(false);
  const [recognizingId, setRecognizingId] = useState<number | null>(null);
  
  const intervalRef = useRef<number | null>(null);
  const audioIntervalRef = useRef<number | null>(null);

  // Função para tocar som de emergência (sirene sawtooth)
  const playSiren = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sawtooth'; // Efeito de zumbido/sirene mais nítido
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      
      // Efeito sonoro de pulsação (frequência subindo e descendo)
      oscillator.frequency.linearRampToValueAtTime(1109.73, audioCtx.currentTime + 0.25); // C#6
      oscillator.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); 
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.48); 
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Áudio bloqueado pelo navegador até interação do usuário.", e);
    }
  }, []);

  const checkAlerts = useCallback(async () => {
    try {
      const data = await iotApi.listarAlertas('PENDENTE');
      
      if (data.length > 0) {
        // Encontra se há novos alertas comparando com os atuais
        setActiveAlerts(data);
        setOpen(true);
      } else {
        setActiveAlerts([]);
        setOpen(false);
      }
    } catch (err) {
      console.error("Erro ao verificar alertas em segundo plano:", err);
    }
  }, []);

  // Polling a cada 4 segundos
  useEffect(() => {
    checkAlerts();
    
    intervalRef.current = window.setInterval(() => {
      checkAlerts();
    }, 4000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [checkAlerts]);

  // Efeito sonoro cíclico enquanto a janela estiver aberta
  useEffect(() => {
    if (open && activeAlerts.length > 0) {
      playSiren();
      
      // Repete a sirene a cada 2 segundos
      audioIntervalRef.current = window.setInterval(() => {
        playSiren();
      }, 2000);
    } else {
      if (audioIntervalRef.current) {
        window.clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
    }

    return () => {
      if (audioIntervalRef.current) {
        window.clearInterval(audioIntervalRef.current);
      }
    };
  }, [open, activeAlerts.length, playSiren]);

  const handleReconhecer = async (id: number) => {
    setRecognizingId(id);
    try {
      await iotApi.reconhecerAlerta(id);
      setActiveAlerts(prev => prev.filter(a => a.id !== id));
      
      // Se não restarem alertas pendentes na lista local, fecha o Dialog
      if (activeAlerts.length <= 1) {
        setOpen(false);
      }
    } catch (err) {
      console.error("Erro ao atender o alerta:", err);
    } finally {
      setRecognizingId(null);
    }
  };

  if (!open || activeAlerts.length === 0) return null;

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          borderTop: '8px solid #d32f2f',
          boxShadow: '0 24px 48px rgba(211, 47, 47, 0.25)',
          overflow: 'hidden',
          // Efeito de shake leve ao abrir para chamar a atenção
          animation: 'sosShake 0.4s ease-in-out',
          '@keyframes sosShake': {
            '0%, 100%': { transform: 'translateX(0)' },
            '15%, 45%, 75%': { transform: 'translateX(-4px)' },
            '30%, 60%, 90%': { transform: 'translateX(4px)' }
          }
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          bgcolor: 'rgba(211, 47, 47, 0.03)', 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderBottom: '1px solid rgba(211, 47, 47, 0.08)'
        }}
      >
        <Box 
          sx={{ 
            bgcolor: '#d32f2f', 
            color: 'white', 
            p: 1.25, 
            borderRadius: '50%', 
            display: 'flex',
            animation: 'sosGlow 1.5s infinite',
            '@keyframes sosGlow': {
              '0%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.6)', transform: 'scale(1)' },
              '70%': { boxShadow: '0 0 0 12px rgba(211, 47, 47, 0)', transform: 'scale(1.06)' },
              '100%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)', transform: 'scale(1)' }
            }
          }}
        >
          <NotificationsActive fontSize="medium" />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight="900" color="#d32f2f" sx={{ letterSpacing: '-0.02em' }}>
            ALERTA DE EMERGÊNCIA ATIVO!
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            IoT Botão de Pânico Pressionado
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4, bgcolor: '#fafafa' }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
          Os seguintes botões de pânico foram acionados e necessitam de atendimento imediato:
        </Typography>

        <Stack spacing={2.5}>
          {activeAlerts.map(alerta => (
            <Card 
              key={alerta.id}
              elevation={0}
              sx={{ 
                borderRadius: 3, 
                border: '1px solid rgba(211, 47, 47, 0.14)', 
                bgcolor: 'white',
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.02)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '6px',
                  height: '100%',
                  bgcolor: '#d32f2f'
                }
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
                  <Box>
                    <Typography variant="caption" color="#d32f2f" fontWeight="800" sx={{ letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                      PACIENTE
                    </Typography>
                    <Typography variant="h6" fontWeight="800" color="text.primary" gutterBottom>
                      {alerta.clienteNome}
                    </Typography>
                    
                    <Stack direction="row" spacing={3} sx={{ mt: 1.5 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                          Dispositivo
                        </Typography>
                        <Typography variant="body2" fontWeight="600" color="text.primary">
                          {alerta.dispositivoNome}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                          Horário
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {dayjs(alerta.criadoEm).format('DD/MM/YYYY [às] HH:mm:ss')}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Button 
                    variant="contained" 
                    color="error" 
                    size="large"
                    startIcon={recognizingId === alerta.id ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                    onClick={() => handleReconhecer(alerta.id)}
                    disabled={recognizingId !== null}
                    sx={{ 
                      borderRadius: 2.5, 
                      px: 3, 
                      py: 1.25,
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
                      bgcolor: '#d32f2f',
                      '&:hover': {
                        bgcolor: '#b71c1c'
                      }
                    }}
                  >
                    Reconhecer e Atender
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#fafafa', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
        <Button 
          onClick={() => setOpen(false)} 
          color="inherit" 
          sx={{ fontWeight: '700', borderRadius: 2 }}
        >
          Fechar Temporariamente
        </Button>
      </DialogActions>
    </Dialog>
  );
}
