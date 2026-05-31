import api from "../lib/Api";
import type { RestricaoAlimentarResponse } from "../dto/restricao/response/RestricaoAlimentarResponse";

export const restricaoAlimentarService = {
  buscarRestricoesAlimentares: async (): Promise<RestricaoAlimentarResponse[]> => {
    const { data } = await api.get<RestricaoAlimentarResponse[]>("/restricao-alimentar");
    return data;
  },
};
