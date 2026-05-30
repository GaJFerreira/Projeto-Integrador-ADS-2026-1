export interface PerfilRequest {
  nome: string;
  email: string;
  bio?: string;
  dataNascimento: string; 
  restricoesAlimentares?: string[];
  personalizacoes?: string[];
}
