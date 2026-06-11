import type { PersonalizacaoResponse } from "./PersonalizacaoResponse";

export interface CatalogoPersonalizacaoResponse {
  categoria: string;
  opcoes: PersonalizacaoResponse[];
}
