import http from "@/lib/http";

const base = "/api/diario_saude/exercicio-recomendado";
const token = () => localStorage.getItem("token");

export type ExercicioSalvo = {
  id: number;
  descricao: string;
};

export const exercicioRecomendadoApi = {
  listar: async (idPrescricao: number): Promise<ExercicioSalvo[]> => {
    const { data } = await http.get(`${base}/prescricao/${idPrescricao}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    console.log("🔍 exercicios retornados:", data);
    return Array.isArray(data) ? data : [];
  },

  adicionar: async (idPrescricao: number, descricao: string): Promise<ExercicioSalvo> => {
    console.log("🔍 adicionando exercicio — idPrescricao:", idPrescricao, "descricao:", descricao);
    const { data } = await http.post(
      base,
      { idPrescricao, descricao },
      { headers: { Authorization: `Bearer ${token()}` } }
    );
    console.log("🔍 resposta do POST:", data);
    return data;
  },

  remover: async (id: number): Promise<void> => {
    await http.delete(`${base}/${id}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
  },
};