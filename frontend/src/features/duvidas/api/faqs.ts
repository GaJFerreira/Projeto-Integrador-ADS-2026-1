import http from '@/lib/http';

export interface FaqItem {
  id: number;
  modulo: string;
  cor: 'success' | 'warning' | 'info' | 'secondary' | 'primary' | 'error' | 'default';
  pergunta: string;
  resposta: string;
}

export type CreateFaqPayload = Omit<FaqItem, 'id'>;

export const faqsApi = {
  listar: async (): Promise<FaqItem[]> => {
    const { data } = await http.get<FaqItem[]>('/api/faqs');
    return data;
  },
  criar: async (payload: CreateFaqPayload): Promise<FaqItem> => {
    const { data } = await http.post<FaqItem>('/api/faqs', payload);
    return data;
  },
  atualizar: async (id: number, payload: CreateFaqPayload): Promise<FaqItem> => {
    const { data } = await http.put<FaqItem>(`/api/faqs/${id}`, payload);
    return data;
  },
  remover: async (id: number): Promise<void> => {
    await http.delete(`/api/faqs/${id}`);
  },
};
