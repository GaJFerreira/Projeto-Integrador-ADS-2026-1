import type { MensagemResponse } from "./MensagemResponse";

export interface MensagemCursorResponse {
  items: MensagemResponse[];
  hasMore: boolean;
  nextBefore: number | null;
}
