import api from "../lib/Api";

export type TipoMidia = "perfil" | "receita";

export const midiaService = {
  buscarMidia: async (tipo: TipoMidia, entidadeId: number): Promise<Blob | null> => {
    try {
      const { data } = await api.get<Blob>(`/midia/${tipo}/${entidadeId}`, {
        responseType: "blob",
      });
      return data;
    } catch {
      return null;
    }
  },
};
