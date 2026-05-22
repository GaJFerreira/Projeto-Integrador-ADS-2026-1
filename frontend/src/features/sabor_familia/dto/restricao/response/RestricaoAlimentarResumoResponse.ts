import type { StatusEnum } from "../../enums/StatusEnum";

export interface RestricaoAlimentarResumoResponse {
  id: number;
  codigo: string;
  labelPerfil: string;
  labelReceita: string;
  exemplos: string;
  status: StatusEnum;
  dataCadastro: string; 
}
