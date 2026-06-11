import api from "../lib/Api";
import type { FavoritoResponse } from "../dto/favorito/FavoritoResponse";

export const favoritoService = {
  adicionarFavorito: async (receitaId: number): Promise<FavoritoResponse> => {
    const { data } = await api.post<FavoritoResponse>(`/receita/${receitaId}/favoritos`);
    return data;
  },

  removerFavorito: async (receitaId: number): Promise<FavoritoResponse> => {
    const { data } = await api.delete<FavoritoResponse>(`/receita/${receitaId}/favoritos`);
    return data;
  },
};
