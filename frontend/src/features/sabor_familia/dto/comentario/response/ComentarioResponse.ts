export interface ComentarioResponse {
  id: number;
  usuarioId: number;
  receitaId: number;
  nomeAutor: string;
  comentario: string;
  dataCadastro: string; 
}
