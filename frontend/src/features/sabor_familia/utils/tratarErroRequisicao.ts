import type { NavigateFunction } from "react-router-dom";
import type { ErrorOrigem } from "../dto/error/ErrorOrigem";
import { extrairErroApi } from "./extrairErroApi";
import { navegarParaErro, type NavegarErroOptions } from "./navegarParaErro";

/** Erros em listagens: mantém o usuário na tela e exibe painel com opção de recarregar. */
export function tratarErroListagem(
  err: unknown,
  setError: (mensagem: string) => void,
  navigate: NavigateFunction,
  origem: ErrorOrigem
): void {
  const { mensagem, statusCode } = extrairErroApi(err);

  if (statusCode === 401 || statusCode === 403) {
    navegarParaErro(navigate, err, { origem, replace: true });
    return;
  }

  setError(mensagem);
}

/** Erros em telas de detalhe ou ações pontuais: página de erro contextual. */
export function tratarErroNavegacao(
  err: unknown,
  navigate: NavigateFunction,
  origem: ErrorOrigem,
  options?: Omit<NavegarErroOptions, "origem">
): void {
  navegarParaErro(navigate, err, { origem, ...options });
}

/** Erros em formulários: mensagem na tela; só redireciona em falha de autenticação. */
export function tratarErroFormulario(
  err: unknown,
  setError: (mensagem: string) => void,
  navigate: NavigateFunction,
  origem: ErrorOrigem
): void {
  const { mensagem, statusCode } = extrairErroApi(err);

  if (statusCode === 401 || statusCode === 403) {
    navegarParaErro(navigate, err, { origem, replace: true });
    return;
  }

  setError(mensagem);
}

/** Ações pontuais (curtir, seguir): mensagem local sem trocar de página. */
export function tratarErroAcao(
  err: unknown,
  setError: (mensagem: string) => void
): void {
  const { mensagem, statusCode } = extrairErroApi(err);

  if (statusCode === 401 || statusCode === 403) {
    setError("Sua sessão expirou. Faça login novamente para continuar.");
    return;
  }

  setError(mensagem);
}
