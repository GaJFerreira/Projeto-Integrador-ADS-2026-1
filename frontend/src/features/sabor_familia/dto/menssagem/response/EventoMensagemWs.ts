import type { MensagemResponse } from "./MensagemResponse";

export type TipoEventoMensagemWs = "NOVA" | "APAGADA";

export interface EventoMensagemWs {
  tipo: TipoEventoMensagemWs;
  conversaId: number;
  mensagem: MensagemResponse;
  ultimaMensagem: string | null;
  dataUltimaMensagem: string | null;
  naoLidas?: number | null;
}
