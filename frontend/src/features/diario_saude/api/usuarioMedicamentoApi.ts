import http from "@/lib/http";

const base = "/api/diario_saude/usuario-medicamento";
const token = () => localStorage.getItem("token");

export type MedicamentoSalvo = {
  id_usuario_medicamento: number;
  nome_medicamento: string;
  principio_ativo?: string;
  concentracao: string;
  via: string;
  dosagem: string;
  frequencia: string;
};

export const usuarioMedicamentoApi = {
  listar: async (usuarioId: number): Promise<MedicamentoSalvo[]> => {
    const { data } = await http.get(`${base}/usuario/${usuarioId}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    return data ?? [];
  },

  adicionar: async (usuarioId: number, med: Omit<MedicamentoSalvo, "id_usuario_medicamento">) => {
    const { data } = await http.post(`${base}/add`, null, {
      params: {
        usuarioId,
        nome_medicamento: med.nome_medicamento,
        principio_ativo: med.principio_ativo,
        concentracao: med.concentracao,
        via: med.via,
        dosagem: med.dosagem,
        frequencia: med.frequencia,
      },
      headers: { Authorization: `Bearer ${token()}` },
    });
    return data;
  },

  remover: async (id: number) => {
    await http.delete(`${base}/delete/${id}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
  },
};
