import type { PerfilResumoResponse } from "../../perfil/response/PerfilResumoResponse";

export interface ConversaResponse {
  id: number;
  contato: PerfilResumoResponse;
  ultimaMensagem: string;
  dataUltimaMensagem: string; 
}
