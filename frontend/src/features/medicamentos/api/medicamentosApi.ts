import http from "@/lib/http";

export interface CreateMedicamentoPayload {

  totalFrasco?: number;
  quantidadeCartela?: number;
  doseDiaria: number;
  tipoDosagem: string;
  tarja: string;
  horarios: { horario: string }[];
  contatoEmergenciaId?: number;     // opcional
}

export const medicamentosApi = {
  criar: async (
    payload: CreateMedicamentoPayload,
    anvisaId: number
  ) => {
    const { data } = await http.post(
      `/api/dose-certa/medicamentos?anvisaId=${anvisaId}`,
      payload
    );

    return data;
  },
};
