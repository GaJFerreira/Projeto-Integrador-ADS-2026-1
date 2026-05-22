import api from "../lib/Api";
import type { EditarPersonalizacaoRequest } from "../dto/personalizacao/request/EditarPersonalizacaoRequest";
import type { CatalogoPersonalizacaoResponse } from "../dto/personalizacao/response/CatalogoPersonalizacaoResponse";
import type { CategoriaPersonalizacaoResponse } from "../dto/personalizacao/response/CategoriaPersonalizacaoResponse";
import type { PersonalizacaoResponse } from "../dto/personalizacao/response/PersonalizacaoResponse";
import type { PersonalizacaoResumoResponse } from "../dto/personalizacao/response/PersonalizacaoResumoResponse";

export const personalizacaoService = {
  buscarCategorias: async (): Promise<CategoriaPersonalizacaoResponse[]> => {
    const { data } = await api.get<CategoriaPersonalizacaoResponse[]>("/personalizacao/categorias");
    return data;
  },

  listarCatalogo: async (): Promise<CatalogoPersonalizacaoResponse[]> => {
    const { data } = await api.get<CatalogoPersonalizacaoResponse[]>("/personalizacao");
    return data;
  },

  listarCatalogoContextoPerfil: async (): Promise<PersonalizacaoResumoResponse[]> => {
    const { data } = await api.get<PersonalizacaoResumoResponse[]>("/personalizacao/perfil");
    return data;
  },

  listarCatalogoContextoReceita: async (): Promise<PersonalizacaoResumoResponse[]> => {
    const { data } = await api.get<PersonalizacaoResumoResponse[]>("/personalizacao/receita");
    return data;
  },

  editarPersonalizacao: async (
    codigo: string,
    request: EditarPersonalizacaoRequest
  ): Promise<PersonalizacaoResponse> => {
    const { data } = await api.put<PersonalizacaoResponse>(`/personalizacao/${codigo}`, request);
    return data;
  },

  ativarPersonalizacao: async (codigo: string): Promise<PersonalizacaoResponse> => {
    const { data } = await api.patch<PersonalizacaoResponse>(`/personalizacao/ativar/${codigo}`);
    return data;
  },

  inativarPersonalizacao: async (codigo: string): Promise<PersonalizacaoResponse> => {
    const { data } = await api.patch<PersonalizacaoResponse>(`/personalizacao/inativar/${codigo}`);
    return data;
  },
};
