import type { ErrorOrigem } from "./ErrorOrigem";

export interface ErrorPageState {
  statusCode?: number;
  message?: string;
  origem?: ErrorOrigem;
  returnTo?: string;
}
