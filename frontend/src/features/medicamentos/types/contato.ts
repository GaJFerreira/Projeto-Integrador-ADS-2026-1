export interface Contato {
  id: number;
  nome: string;
  telefone: string;
  relacao?: string;

}

export type ContatoPayload = {
#  usuarioId?: number; // hook adiciona se faltar
  nome: string;
  telefone: string;
  relacao?: string;
};
