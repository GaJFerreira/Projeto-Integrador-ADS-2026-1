import http from '@/lib/http';

export interface MedicamentoAnvisa {
  id: number;
  nomeProduto: string;
  farmaciaPoupular: boolean;
}

export const medicamentosApi = {
  listar: async (anvisaId?: number): Promise<MedicamentoAnvisa[]> => {
    const params: any = {};
    if (anvisaId) params.anvisaId = anvisaId;

    const { data } = await http.get<MedicamentoAnvisa[]>('/api/dose-certa/medicamentos',
        { params });
    return Array.isArray(data) ? data : [];
  }
};
