import http from "@/lib/http";

export interface RegistroTomadaDTO {
  id: number;
  horarioRealTomado: string;
  dataPrevista: string;
}

export interface MedicamentoHorarioDTO {
  id: number;
  horario: string;
  tomadoHoje: boolean;                    // ✔ vem do backend
  proximaExecucao?: string | null;        // ✔ novo campo do backend
  registroTomada?: RegistroTomadaDTO | null; // ✔ novo campo
}

export interface MedicamentoDTO {
  id: number;
  nome: string;
  tarja: string;
  contatarEmergencia: boolean;
  diasRestantes?: number | null;
  horarios: MedicamentoHorarioDTO[];      // ✔ agora compatível
}

export const medicamentoApi = {
  async listarMeus(): Promise<MedicamentoDTO[]> {
    const response = await http.get(
      `/api/dose-certa/medicamentos/detalhes`
    );

    return response.data;
  },

  async listarHistorico() {
    const resp = await http.get(`/api/dose-certa/registro-tomada/meus`);
    return resp.data;
  },

  async registrarTomada(horarioId: number) {
    return http.post(`/api/dose-certa/registro-tomada?horarioId=${horarioId}`);
  },

  async buscarPorId(id: number) {
    const resp = await http.get(`/api/dose-certa/medicamentos/${id}`);
    return resp.data;
  },

  async atualizar(id: number, payload: any) {
    const resp = await http.put(`/api/dose-certa/medicamentos/${id}`, payload);
    return resp.data;
  },

  async excluir(id: number) {
    return http.delete(`/api/dose-certa/medicamentos/${id}`);
  },

  async criar(payload: any, anvisaId: number) {
    const { data } = await http.post(
      `/api/dose-certa/medicamentos?anvisaId=${anvisaId}`,
      payload
    );
    return data;
  },

  async limparHistorico() {
    return http.delete(`/api/dose-certa/registro-tomada/meus`);
  },
};
