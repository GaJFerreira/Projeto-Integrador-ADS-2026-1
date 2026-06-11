import api from "../lib/Api";
import type { ComentarioRequest } from "../dto/comentario/request/ComentarioRequest";
import type { ComentarioResponse } from "../dto/comentario/response/ComentarioResponse";
import type { PerfilComentarioResponse } from "../dto/receita/response/PerfilComentarioResponse";
import type { RemoverComentarioResponse } from "../dto/comentario/response/RemoverComentarioResponse";

export const comentarioService = {
  buscarComentarios: async (receitaId: number): Promise<PerfilComentarioResponse[]> => {
    const { data } = await api.get<PerfilComentarioResponse[]>(`/receita/${receitaId}/comentarios`);
    return data;
  },

  adicionarComentario: async (
    receitaId: number,
    request: ComentarioRequest
  ): Promise<ComentarioResponse> => {
    const { data } = await api.post<ComentarioResponse>(
      `/receita/${receitaId}/comentarios`,
      request
    );
    return data;
  },

  removerComentario: async (
    receitaId: number,
    comentarioId: number
  ): Promise<RemoverComentarioResponse> => {
    const { data } = await api.delete<RemoverComentarioResponse>(
      `/receita/${receitaId}/comentarios/${comentarioId}`
    );
    return data;
  },
};