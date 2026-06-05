// src/api/anvisaApi.ts (ou onde estiver)
import http from '@/lib/http';

export interface MedicamentoAnvisaDto {
id: number;
nomeProduto: string;
boolean: farmaciaPopular
}


export const anvisaApi = {
  listar: async (params?: { nome?: string; all?: boolean }) => {
    const { data } = await http.get<MedicamentoAnvisaDto[]>(
       '/api/dose-certa/medicamentos/anvisa',
        { params: params ?? {}
    });
    return Array.isArray(data) ? data : [];
  },

  listarTodos: async () => {
    return anvisaApi.listar({ all: true });
  },

  isFarmaciaPopular: async (nome: string) => {
    const { data } = await http.get<boolean>(
       '/api/dose-certa/medicamentos/anvisa/farmacia-popular',
       { params: { nome }
    });
    return data;
}

};
