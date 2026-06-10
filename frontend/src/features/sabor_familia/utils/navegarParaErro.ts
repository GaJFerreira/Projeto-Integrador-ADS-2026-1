import type { NavigateFunction } from "react-router-dom";
import type { ErrorPageState } from "../dto/error/ErrorPageState";
import { extrairErroApi } from "./extrairErroApi";
import type { ErrorOrigem } from "../dto/error/ErrorOrigem";
import { obterConfigOrigem } from "./errorMapUtils";

export interface NavegarErroOptions {
  origem?: ErrorOrigem;
  returnTo?: string;
  replace?: boolean;
}

export function navegarParaErro(
  navigate: NavigateFunction,
  err: unknown,
  options?: NavegarErroOptions
): void {
  const { mensagem, statusCode } = extrairErroApi(err);
  const origem = options?.origem ?? "geral";
  const configOrigem = obterConfigOrigem(origem);

  const state: ErrorPageState = {
    statusCode,
    message: mensagem,
    origem,
    returnTo: options?.returnTo ?? configOrigem.returnTo,
  };

  navigate("/sabor-familia/error", {
    state,
    replace: options?.replace ?? false,
  });
}
