import api from "../lib/Api";
import type { RestricaoAlimentarResponse } from "../dto/restricao/response/RestricaoAlimentarResponse";
import type { EditarRestricaoAlimentarRequest } from "../dto/restricao/request/EditarRestricaoAlimentarRequest";

export const restricaoAlimentarService = {
  buscarRestricoesAlimentares: async (): Promise<RestricaoAlimentarResponse[]> => {
    const { data } = await api.get<RestricaoAlimentarResponse[]>("/restricao-alimentar");
    return data;
  },

  buscarRestricaoAlimentar: async (codigo: string): Promise<RestricaoAlimentarResponse> => {
    const { data } = await api.get<RestricaoAlimentarResponse>(`/restricao-alimentar/${codigo}`);
    return data;
  },

  editarRestricaoAlimentar: async (
    codigo: string,
    request: EditarRestricaoAlimentarRequest
  ): Promise<RestricaoAlimentarResponse> => {
    const { data } = await api.put<RestricaoAlimentarResponse>(`/restricao-alimentar/${codigo}`, request);
    return data;
  },

  ativarRestricaoAlimentar: async (codigo: string): Promise<RestricaoAlimentarResponse> => {
    const { data } = await api.patch<RestricaoAlimentarResponse>(`/restricao-alimentar/ativar/${codigo}`);
    return data;
  },

  inativarRestricaoAlimentar: async (codigo: string): Promise<RestricaoAlimentarResponse> => {
    const { data } = await api.patch<RestricaoAlimentarResponse>(`/restricao-alimentar/inativar/${codigo}`);
    return data;
  },
};
