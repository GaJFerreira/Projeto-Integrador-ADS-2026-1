import type { StatusEnum } from "../../enums/StatusEnum";

export interface RestricaoAlimentarResumoResponse {
  id: number;
  codigo: string;
  /** Rótulo conforme o contexto da API (perfil ou receita). */
  label: string;
  exemplos: string;
  labelPerfil?: string;
  labelReceita?: string;
  status?: StatusEnum;
  dataCadastro?: string;
}
