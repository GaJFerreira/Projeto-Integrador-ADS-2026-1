import http from '@/lib/http';

const BASE = '/api/lista-compras/admin/patologias';
const ITENS_BASE = '/api/lista-compras/patologia-itens';

export interface AdminPatologia {
  id: number;
  nome: string;
  descricao?: string;
}

export interface AdminPatologiaPayload {
  nome: string;
  descricao?: string;
}

export interface PatologiaItem {
  id: number;
  patologia: AdminPatologia;
  produto: { id: number; nome: string };
  produtoSugestao?: { id: number; nome: string } | null;
}

export interface PatologiaItemPayload {
  patologiaId: number;
  produtoId: number;
  produtoSugestaoId?: number | null;
}

export const adminPatologiasApi = {
  listar: async (): Promise<AdminPatologia[]> => {
    const { data } = await http.get<AdminPatologia[]>(BASE);
    return Array.isArray(data) ? data : [];
  },

  criar: async (payload: AdminPatologiaPayload): Promise<AdminPatologia> => {
    const { data } = await http.post<AdminPatologia>(BASE, payload);
    return data;
  },

  atualizar: async (id: number, payload: AdminPatologiaPayload): Promise<AdminPatologia> => {
    const { data } = await http.put<AdminPatologia>(`${BASE}/${id}`, payload);
    return data;
  },

  excluir: async (id: number): Promise<void> => {
    await http.delete(`${BASE}/${id}`);
  },

  listarUsuarios: async (patologiaId: number): Promise<number[]> => {
    const { data } = await http.get<number[]>(`${BASE}/${patologiaId}/usuarios`);
    return Array.isArray(data) ? data : [];
  },

  vincularUsuario: async (patologiaId: number, usuarioId: number): Promise<void> => {
    await http.post(`${BASE}/${patologiaId}/usuarios/${usuarioId}`);
  },

  desvincularUsuario: async (patologiaId: number, usuarioId: number): Promise<void> => {
    await http.delete(`${BASE}/${patologiaId}/usuarios/${usuarioId}`);
  },

  listarItens: async (patologiaId: number): Promise<PatologiaItem[]> => {
    const { data } = await http.get<PatologiaItem[]>(`${ITENS_BASE}/patologia/${patologiaId}`);
    return Array.isArray(data) ? data : [];
  },

  vincularProduto: async (payload: PatologiaItemPayload): Promise<PatologiaItem> => {
    const { data } = await http.post<PatologiaItem>(ITENS_BASE, payload);
    return data;
  },

  desvincularProduto: async (itemId: number): Promise<void> => {
    await http.delete(`${ITENS_BASE}/${itemId}`);
  },
};
