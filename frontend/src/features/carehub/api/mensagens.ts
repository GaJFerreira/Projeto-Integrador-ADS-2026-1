import http from '../libHttp';

export interface ContatoDTO {
  id: number;
  nome: string;
  perfil: string;
  email: string;
  mensagensNaoLidas?: number; // Contador de mensagens não lidas (badge)
  ultimaMensagem?: string; // Preview da última mensagem
  dataUltimaMensagem?: string; // Data/hora da última mensagem
}

export async function contarMensagensNaoLidas(): Promise<number> {
  try {
    const response = await http.get<number>('/api/carehub/mensagens/contador-nao-lidas');
    return typeof response.data === 'number' ? response.data : 0;
  } catch {
    return 0;
  }
}

export async function listarContatos(): Promise<ContatoDTO[]> {
  const response = await http.get<ContatoDTO[]>('/api/carehub/mensagens/contatos');
  return response.data;
}

export async function marcarConversaComoLida(remetenteId: number): Promise<void> {
  await http.put(`/api/carehub/mensagens/marcar-lidas/${remetenteId}`);
}
