import type { PerfilResumoResponse } from "../../perfil/response/PerfilResumoResponse";

export interface MensagemResponse {
  id: number;
  perfilRemetente: PerfilResumoResponse;
  perfilDestinatario: PerfilResumoResponse;
  texto: string;
  dataEnvio: string; 
}
