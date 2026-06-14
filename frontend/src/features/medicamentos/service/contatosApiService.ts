// src/features/service/contatosApiService.ts
import { contatosEmergenciaApi } from "../api/contatosEmergenciaApi";

export interface Contato {
  id: number;
  nome: string;
  telefone: string;
  relacao?: string;

}

export interface ContatoPayload {
  nome: string;
  telefone: string;
  relacao?: string;
}

/**
 * LISTAR CONTATOS DO USUÁRIO LOGADO
 */
export async function carregarContatosDoUsuario(): Promise<Contato[]> {
  return contatosEmergenciaApi.listar();
}

/**
 * CRIAR CONTATO
 */
export async function criarContato(payload: ContatoPayload): Promise<Contato> {
  return contatosEmergenciaApi.criar(payload);
}

/**
 * ATUALIZAR CONTATO
 * (⚠️ não envia usuarioId — backend não aceita)
 */
export async function atualizarContato(id: number, payload: ContatoPayload): Promise<Contato> {
  return contatosEmergenciaApi.atualizar(id, payload);
}

/**
 * EXCLUIR CONTATO
 */
export async function excluirContato(id: number): Promise<void> {
  return contatosEmergenciaApi.excluir(id);
}
