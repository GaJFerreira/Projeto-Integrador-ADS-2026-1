import http from '@/lib/http';

export type TipoSugestao = 'SUGESTAO' | 'DUVIDA' | 'CONTATO';

export interface SugestaoRequest {
  tipo: TipoSugestao;
  assunto: string;
  mensagem: string;
}

export interface SugestaoResponse {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  tipo: TipoSugestao;
  assunto: string;
  mensagem: string;
  lida: boolean;
  createdAt: string;
}

export const sugestoesApi = {
  enviar: async (dto: SugestaoRequest): Promise<SugestaoResponse> => {
    const { data } = await http.post<SugestaoResponse>('/api/sugestoes', dto);
    return data;
  },

  minhas: async (): Promise<SugestaoResponse[]> => {
    const { data } = await http.get<SugestaoResponse[]>('/api/sugestoes/minhas');
    return data;
  },

  // Admin
  listarTodas: async (): Promise<SugestaoResponse[]> => {
    const { data } = await http.get<SugestaoResponse[]>('/api/sugestoes');
    return data;
  },

  contarNaoLidas: async (): Promise<number> => {
    const { data } = await http.get<{ count: number }>('/api/sugestoes/nao-lidas/count');
    return data.count;
  },

  marcarComoLida: async (id: number): Promise<SugestaoResponse> => {
    const { data } = await http.patch<SugestaoResponse>(`/api/sugestoes/${id}/lida`);
    return data;
  },

  deletar: async (id: number): Promise<void> => {
    await http.delete(`/api/sugestoes/${id}`);
  },
};
