import type { StatusEnum } from "../../enums/StatusEnum";

export interface RestricaoAlimentarResponse {
  id: number;
  codigo: string;
  labelPerfil: string;
  labelReceita: string;
  exemplos: string;
  status: StatusEnum; 
  dataCadastro: string; 
}
