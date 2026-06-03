import type { MensagemResponse } from "./MensagemResponse";

export interface RemoverMensagemResponse {
  conversaId: number;
  mensagem: MensagemResponse;
  ultimaMensagem: string | null;
  dataUltimaMensagem: string | null;
  naoLidas: number;
}
