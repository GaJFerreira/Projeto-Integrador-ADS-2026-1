import api from "../lib/Api";
import type { CurtidaResponse } from "../dto/curtida/CurtidaResponse";

export const curtidaService = {
  adicionarCurtida: async (receitaId: number): Promise<CurtidaResponse> => {
    const { data } = await api.post<CurtidaResponse>(`/receita/${receitaId}/curtidas`);
    return data;
  },

  removerCurtida: async (receitaId: number): Promise<CurtidaResponse> => {
    const { data } = await api.delete<CurtidaResponse>(`/receita/${receitaId}/curtidas`);
    return data;
  },
};
