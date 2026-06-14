import http from "@/lib/http";
import type { Usuario } from "./types";

const base = "/api/diario_saude/usuario";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const getUsuarioLogado = () => {
  try {
    return JSON.parse(localStorage.getItem("usuario") || "null") ||
      JSON.parse(localStorage.getItem("user") || "null");
  } catch { return null; }
};

export const usuarioApi = {
  porId: async (id: number): Promise<Usuario> => {
    const { data } = await http.get(`${base}/${id}`, { headers: getAuthHeader() });
    return data;
  },

  atualizar: async (payload: Partial<Usuario> & { platformUserId: number }): Promise<Usuario> => {
    const { data } = await http.put(base, payload, {
      headers: { ...getAuthHeader(), "Content-Type": "application/json" },
    });
    return data;
  },

  listarPacientes: async (): Promise<Usuario[]> => {
    const { data } = await http.get(base, { headers: getAuthHeader() });
    return Array.isArray(data) ? data : [];
  },

  porUsuarioId: async (userId: number): Promise<Usuario> => {
    // Pega o nome real do localStorage — a resposta do login tem username com o nome real
    const usuarioLogado = getUsuarioLogado();
    const nomeReal = usuarioLogado?.username ?? usuarioLogado?.name ?? "";

    const { data } = await http.get(`${base}/por-user/${userId}`, {
      headers: getAuthHeader(),
      params: nomeReal ? { nome: nomeReal } : undefined,
    });
    return data;
  },
};