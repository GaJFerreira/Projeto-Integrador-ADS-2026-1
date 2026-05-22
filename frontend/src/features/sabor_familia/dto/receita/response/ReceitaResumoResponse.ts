export interface ReceitaResumoResponse {
  id: number;
  titulo: string;
  fotoCapaUrl: string | null;
  restritaParaUsuario: boolean;
  dataCadastro: string;
}
