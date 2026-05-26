import { useState, useCallback, useEffect, useRef } from 'react';
import { iotApi } from '../api';
import type { AlertaEmergenciaResponseDTO } from '../types';

export function useAlertas() {
  const [alertas, setAlertas] = useState<AlertaEmergenciaResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Função para emitir um alerta sonoro seguro usando Web Audio API nativa
  const playSiren = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine'; // Som mais limpo (beep)
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
      
      // Beep 1
      gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime); 
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15); 
      
      // Beep 2
      gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn("Navegador bloqueou ou não suporta o áudio automático", e);
    }
  }, []);

  const fetchAlertas = useCallback(async (silently = false) => {
    if (!silently) setLoading(true);
    setError(null);
    try {
      const data = await iotApi.listarAlertas('PENDENTE'); // Busca apenas os não resolvidos
      
      setAlertas((prev) => {
        // Verifica se chegou um alerta NOVO que não estava na lista anterior
        const prevIds = prev.map(a => a.id);
        const hasNew = data.some(alerta => !prevIds.includes(alerta.id));
        
        // Se tem um alerta novo, toca a sirene
        if (hasNew) {
          playSiren();
        }
        
        return data;
      });
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao buscar alertas');
    } finally {
      if (!silently) setLoading(false);
    }
  }, [playSiren]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    fetchAlertas(); // Busca imediata na montagem
    
    // Polling a cada 3 segundos
    intervalRef.current = window.setInterval(() => {
      fetchAlertas(true);
    }, 3000);
  }, [fetchAlertas]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startPolling();
    return () => stopPolling(); // Limpa o intervalo ao desmontar a página
  }, [startPolling, stopPolling]);

  const reconhecerAlerta = async (id: number) => {
    try {
      await iotApi.reconhecerAlerta(id);
      // Remove otimisticamente da tela para parecer mais rápido
      setAlertas(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao reconhecer alerta';
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    alertas,
    loading,
    error,
    reconhecerAlerta,
    fetchAlertas,
    playSiren // exposto para testes manuais na tela, se precisar
  };
}
