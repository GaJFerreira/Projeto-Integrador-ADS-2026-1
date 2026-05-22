
import type { DetalhesPerfil } from "./DetalhesPerfil";
import type { EstatisticasPerfil } from "./EstatisticasPerfil";
import type { RestricaoAlimentarResumoResponse } from "./../../restricao/response/RestricaoAlimentarResumoResponse";

export interface PerfilResponse {
  id: number;
  usuarioId: number;
  proprioPerfil: boolean;
  seguindoPerfil?: boolean;      
  detalhes: DetalhesPerfil;
  estatisticas: EstatisticasPerfil;
  restricoesAlimentares: RestricaoAlimentarResumoResponse[];
  dataCadastro: string;
}
