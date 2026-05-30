export interface PerfilResumoResponse {
  perfilId: number;
  usuarioId: number;
  nome: string;
  possuiMidia: boolean;
  seguindoPeloUsuario?: boolean;
}
