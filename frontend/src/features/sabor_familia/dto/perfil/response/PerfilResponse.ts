
import type { DetalhesPerfil } from "./DetalhesPerfil";
import type { EstatisticasPerfil } from "./EstatisticasPerfil";
import type { RestricaoAlimentarResumoResponse } from "./../../restricao/response/RestricaoAlimentarResumoResponse";
import type { PersonalizacaoResumoResponse } from "../../personalizacao/response/PersonalizacaoResumoResponse";

export interface PerfilResponse {
  id: number;
  usuarioId: number;
  proprioPerfil: boolean;
  seguindoPerfil?: boolean;
  detalhes: DetalhesPerfil;
  estatisticas: EstatisticasPerfil;
  restricoesAlimentares: RestricaoAlimentarResumoResponse[];
  personalizacao: PersonalizacaoResumoResponse[];
  dataCadastro: string;
}
