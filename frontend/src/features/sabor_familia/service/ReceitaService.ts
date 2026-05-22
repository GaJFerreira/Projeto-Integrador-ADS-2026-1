import api from "../lib/Api";
import type { ReceitaRequest } from "../dto/receita/request/ReceitaRequest";
import type { ReceitaResponse } from "../dto/receita/response/ReceitaResponse";
import type { ReceitaResumoResponse } from "../dto/receita/response/ReceitaResumoResponse";
import type { RemoverReceitaResponse } from "../dto/receita/response/RemoverReceitaResponse";
import type { PageResponse } from "../dto/page/PageResponse";

export const receitaService = {
  feedPersonalizado: async (
    page = 0,
    size = 20
  ): Promise<PageResponse<ReceitaResponse>> => {
    const { data } = await api.get<PageResponse<ReceitaResponse>>("/receita/feed", {
      params: { page, size, sort: "dataCadastro,desc" },
    });
    return data;
  },

  explorarReceitas: async (
    page = 0,
    size = 20,
    titulo?: string,
    tipoRefeicao?: string
  ): Promise<PageResponse<ReceitaResumoResponse>> => {
    const { data } = await api.get<PageResponse<ReceitaResumoResponse>>("/receita/explorar", {
      params: {
        page,
        size,
        ...(titulo       && { titulo }),
        ...(tipoRefeicao && { tipoRefeicao }),
      },
    });
    return data;
  },

  buscarReceitasPerfil: async (
    perfilId: number,
    page = 0,
    size = 20
  ): Promise<PageResponse<ReceitaResumoResponse>> => {
    const { data } = await api.get<PageResponse<ReceitaResumoResponse>>(
      `/receita/perfil/${perfilId}`,
      { params: { page, size, sort: "dataCadastro,desc" } }
    );
    return data;
  },

  buscarReceita: async (receitaId: number): Promise<ReceitaResponse> => {
    const { data } = await api.get<ReceitaResponse>(`/receita/${receitaId}`);
    return data;
  },

  buscarReceitasFavoritas: async (
    page = 0,
    size = 20
  ): Promise<PageResponse<ReceitaResponse>> => {
    const { data } = await api.get<PageResponse<ReceitaResponse>>("/receita/favoritos", {
      params: { page, size, sort: "dataCadastro,desc" },
    });
    return data;
  },

  criarReceita: async (request: ReceitaRequest): Promise<ReceitaResponse> => {
    const { data } = await api.post<ReceitaResponse>("/receita", request);
    return data;
  },

  editarReceita: async (
    receitaId: number,
    request: ReceitaRequest
  ): Promise<ReceitaResponse> => {
    const { data } = await api.put<ReceitaResponse>(`/receita/${receitaId}`, request);
    return data;
  },

  removerReceita: async (receitaId: number): Promise<RemoverReceitaResponse> => {
    const { data } = await api.delete<RemoverReceitaResponse>(`/receita/${receitaId}`);
    return data;
  },
};
