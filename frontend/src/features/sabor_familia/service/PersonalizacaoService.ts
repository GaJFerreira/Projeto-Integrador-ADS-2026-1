import api from "../lib/Api";
import type { CatalogoPersonalizacaoResponse } from "../dto/personalizacao/response/CatalogoPersonalizacaoResponse";
import type { PersonalizacaoResumoResponse } from "../dto/personalizacao/response/PersonalizacaoResumoResponse";

export const personalizacaoService = {
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
};
