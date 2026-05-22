import type { PerfilResumoResponse } from "../../perfil/response/PerfilResumoResponse";
import type { PersonalizacaoResumoResponse } from "../../personalizacao/response/PersonalizacaoResumoResponse";
import type { RestricaoAlimentarResumoResponse } from "../../restricao/response/RestricaoAlimentarResumoResponse";
import type { DetalhesReceita } from "./DetalhesReceita";
import type { EstatisticasReceita } from "./EstatisticasReceita";

export interface ReceitaResponse {
  id: number;
  curtidoPeloUsuario: boolean;
  restritaParaUsuario: boolean;
  autor: PerfilResumoResponse;
  detalhes: DetalhesReceita;
  estatisticas: EstatisticasReceita;
  restricoesAlimentares: RestricaoAlimentarResumoResponse[];
  personalizacao: PersonalizacaoResumoResponse[];
  dataCadastro: string; 
}
