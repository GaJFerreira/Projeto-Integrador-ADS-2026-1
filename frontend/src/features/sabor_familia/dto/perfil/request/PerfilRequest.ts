export interface PerfilRequest {
  nome: string;
  email: string;
  bio?: string;
  dataNascimento: string; 
  fotoPerfilUrl: string;
  restricoesAlimentares?: string[];
  personalizacoes?: string[];
}
