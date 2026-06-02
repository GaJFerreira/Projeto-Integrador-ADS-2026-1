import type { MensagemResponse } from "./MensagemResponse";

export interface NovaMensagemEvent {
  conversaId: number;
  mensagem: MensagemResponse;
}
