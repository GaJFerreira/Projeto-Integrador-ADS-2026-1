import { useQuery } from '@tanstack/react-query';
import { contarMensagensNaoLidas } from '../api/mensagens';
import { initializeAuthToken } from '../components/auth';

export function useMensagensNaoLidas(usuarioId: number | undefined) {
  return useQuery({
    queryKey: ['mensagens-nao-lidas', usuarioId],
    queryFn: async () => {
      await initializeAuthToken();
      return contarMensagensNaoLidas();
    },
    enabled: !!usuarioId,
    refetchInterval: 30000,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if ((error?.status === 0 || error?.original?.code === 'ERR_NETWORK') && failureCount >= 1) {
        return false;
      }
      if (error?.response?.status === 401 && failureCount < 2) {
        void initializeAuthToken();
        return true;
      }
      return false;
    },
  });
}
