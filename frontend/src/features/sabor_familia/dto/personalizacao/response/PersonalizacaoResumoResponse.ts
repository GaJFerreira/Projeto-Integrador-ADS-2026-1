import type { CategoriaPersonalizacaoEnum } from "../../enums/CategoriaPersonalizacaoEnum";

export interface PersonalizacaoResumoResponse {
  id: number;
  categoria: CategoriaPersonalizacaoEnum;
  codigo: string;
  label: string;
}
