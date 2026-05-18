// API endpoints para a feature remember
// Exemplo inicial para integração com o backend

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

// Salvar novo diário
export const postDiario = async (data: {
  titulo: string;
  conteudo: string;
  identificadorUsuario: number;
}) => {
  // Ajuste o identificadorUsuario conforme a lógica de autenticação
  return http.post(`${REMEMBER_API}/diarios`, data);
};
