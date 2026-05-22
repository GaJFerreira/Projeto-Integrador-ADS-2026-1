import api from "../lib/Api";
import type { CurtidaResponse } from "../dto/curtida/CurtidaResponse";
import type { PerfilCurtidaResponse } from "../dto/receita/response/PerfilCurtidaResponse";

export const curtidaService = {
  buscarCurtidas: async (receitaId: number): Promise<PerfilCurtidaResponse[]> => {
    const { data } = await api.get<PerfilCurtidaResponse[]>(`/receita/${receitaId}/curtidas`);
    return data;
  },

  adicionarCurtida: async (receitaId: number): Promise<CurtidaResponse> => {
    const { data } = await api.post<CurtidaResponse>(`/receita/${receitaId}/curtidas`);
    return data;
  },

  removerCurtida: async (receitaId: number): Promise<CurtidaResponse> => {
    const { data } = await api.delete<CurtidaResponse>(`/receita/${receitaId}/curtidas`);
    return data;
  },
};
