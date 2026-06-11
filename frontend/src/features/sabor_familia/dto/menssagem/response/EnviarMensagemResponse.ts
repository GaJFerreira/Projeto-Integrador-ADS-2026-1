import type { MensagemResponse } from "./MensagemResponse";

export interface EnviarMensagemResponse {
  conversaId: number;
  mensagem: MensagemResponse;
}
