export interface PerfilComentarioResponse {
  id: number;
  perfilId: number;
  nomePerfil: string;
  fotoPerfilUrl: string | null;
  comentario: string;
  dataComentario: string;
}
