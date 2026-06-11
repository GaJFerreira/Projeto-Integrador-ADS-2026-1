import type { CategoriaPersonalizacaoEnum } from "../../enums/CategoriaPersonalizacaoEnum";
import type { StatusEnum } from "../../enums/StatusEnum";

export interface PersonalizacaoResponse {
  id: number;
  categoria: CategoriaPersonalizacaoEnum;
  codigo: string;
  labelPerfil: string;
  labelReceita: string;
  status: StatusEnum;
}
