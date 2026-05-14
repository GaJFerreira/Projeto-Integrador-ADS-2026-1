import http from "@/lib/http";
import type { Pergunta, Opcao, RespostaDTO } from "../api/types";

const base = "/api/diario_saude/questionario";

export const questionarioApi = {
  listarPerguntas: async (): Promise<Pergunta[]> => {
    console.log("Antes do useQuery");
    const token = localStorage.getItem("token");
    const { data } = await http.get(`${base}/perguntas`, {
      headers: { Authorization: `Bearer ${token}` },
    });


    if (!Array.isArray(data)) return [];

    return data.map((p: any) => ({
      id: p.id,
      texto: p.texto,
      opcoes: Array.isArray(p.opcoes)
        ? p.opcoes.map((o: any) => ({ texto: o.texto, peso: o.peso }))
        : [],
    }));
  },

  enviarRespostas: async (usuarioId: number, respostas: RespostaDTO[]) => {
    const token = localStorage.getItem("token");
    const { data } = await http.post(`${base}/responder/${usuarioId}`, respostas, {
      headers: { Authorization: `Bearer ${token}` },

    });
    return data;
  },

  obterRespostas: async (usuarioId: number) => {
    const token = localStorage.getItem("token");
    const { data } = await http.get(`${base}/respostas/${usuarioId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(data) ? data : [];
  },

  criarPergunta: async (texto: string, opcoesJson: string) => {
    const token = localStorage.getItem("token");
    const { data } = await http.post(`${base}/perguntas`,
      { texto, opcoesJson },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  },

  editarPergunta: async (id: number, texto: string, opcoesJson: string) => {
    const token = localStorage.getItem("token");
    const { data } = await http.put(`${base}/perguntas/${id}`,
      { texto, opcoesJson },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  },

  deletarPergunta: async (id: number) => {
    const token = localStorage.getItem("token");
    await http.delete(`${base}/perguntas/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
