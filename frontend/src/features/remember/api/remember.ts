import http from "../../../lib/http";

const REMEMBER_API = "/api/remember";

export const getDiarios = async () => {
  return http.get(`${REMEMBER_API}/diarios`);
};

export const getLembrancas = async () => {
  return http.get(`${REMEMBER_API}/lembrancas`);
};

export const getConquistas = async () => {
  return http.get(`${REMEMBER_API}/conquistas`);
};

export const getPerguntasCognitivas = async () => {
  return http.get(`${REMEMBER_API}/perguntas-cognitivas`);
};

export const getPerguntasCognitivasPorStatus = async (status: "PENDENTES" | "RESPONDIDAS") => {
  return http.get(`${REMEMBER_API}/perguntas-cognitivas`, {
    params: { status },
  });
};

export const gerarPerguntaCognitiva = async () => {
  return http.get(`${REMEMBER_API}/perguntas-cognitivas/gerar`);
};

export const postPerguntaTemplate = async (data: {
  textoTemplate: string;
  gatilhoTipo: number;
  gatilhoValores?: string;
  campoAlvo?: string;
  campoPlaceholder?: string;
  ativo?: boolean;
}) => {
  return http.post(`${REMEMBER_API}/pergunta-templates`, data);
};

export const postRespostaPergunta = async (data: {
  identificadorPergunta: number;
  textoResposta: string;
}) => {
  return http.post(`${REMEMBER_API}/respostas-perguntas`, data);
};

export const getRespostasPerguntas = async () => {
  return http.get(`${REMEMBER_API}/respostas-perguntas`);
};

export const postDiario = async (data: {
  titulo: string;
  conteudo: string;
  identificadorUsuario: number;
}) => {
  return http.post(`${REMEMBER_API}/diarios`, data);
};
