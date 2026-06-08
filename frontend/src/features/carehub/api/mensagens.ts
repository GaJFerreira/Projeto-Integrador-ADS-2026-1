import http from '../libHttp';
import type { MensagemResponseDTO } from '../types';


export interface ContatoDTO {
  id: number;
  nome: string;
  perfil: string;
  email: string;
  mensagensNaoLidas?: number; // Contador de mensagens não lidas (badge)
  ultimaMensagem?: string; // Preview da última mensagem
  dataUltimaMensagem?: string; // Data/hora da última mensagem
  ultimoRemetenteId?: number; // ID do remetente da última mensagem (platformId)
  // Calculado pelo backend com IDs locais — sem risco de mismatch platformId/localId.
  // true  → a última mensagem foi enviada pelo usuário logado (não disparar popup)
  // false → foi enviada pelo contato (disparar popup)
  // null/undefined → desconhecido, comportamento permissivo (dispara popup)
  ultimaMensagemEnviadaPorMim?: boolean;
}

export async function contarMensagensNaoLidas(): Promise<number> {
  try {
    const response = await http.get<number>('/api/carehub/mensagens/contador-nao-lidas');
    return typeof response.data === 'number' ? response.data : 0;
  } catch {
    return 0;
  }
}

export async function buscarMensagensNaoLidas(): Promise<MensagemResponseDTO[]> {
  try {
    const response = await http.get<MensagemResponseDTO[]>('/api/carehub/mensagens/nao-lidas');
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
}


export async function listarContatos(): Promise<ContatoDTO[]> {
  const response = await http.get<ContatoDTO[]>('/api/carehub/mensagens/contatos');
  return response.data;
}

export async function marcarConversaComoLida(remetenteId: number): Promise<void> {
  await http.put(`/api/carehub/mensagens/marcar-lidas/${remetenteId}`);
}

/**
 * Verifica se o chat com o usuário informado está ativo (permite enviar mensagens).
 * Retorna { ativo: false } em caso de erro para não bloquear a UI inesperadamente.
 */
export async function verificarChatAtivo(usuarioId: number): Promise<{ ativo: boolean }> {
  try {
    const response = await http.get<{ ativo: boolean }>(`/api/carehub/mensagens/chat-ativo/${usuarioId}`);
    return response.data;
  } catch {
    // Em caso de erro de rede, consideramos ativo para não travar o usuário
    return { ativo: true };
  }
}
