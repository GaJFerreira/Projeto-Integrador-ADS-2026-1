export interface AlertErrorDto {
  campo: string;
  motivo: string;
}

export interface ApiErrorBody {
  error?: string;
  message?: string;
  status?: number;
  errors?: AlertErrorDto[];
}

export interface ErroApiResult {
  mensagem: string;
  errosCampo: Record<string, string>;
  statusCode?: number;
}

const MENSAGEM_PADRAO = "Não foi possível concluir a operação. Tente novamente.";

function normalizarCampo(campo: string): string {
  return campo.replace(/^dados\./, "").trim();
}

export function extrairErroApi(err: unknown): ErroApiResult {
  const response = (err as { response?: { status?: number; data?: ApiErrorBody } })
    ?.response;

  if (!response) {
    return { mensagem: MENSAGEM_PADRAO, errosCampo: {} };
  }

  const data = response.data;
  const errosCampo: Record<string, string> = {};

  if (data?.errors?.length) {
    for (const item of data.errors) {
      if (!item.campo) continue;
      const chave = normalizarCampo(item.campo);
      errosCampo[chave] = item.motivo?.trim() || "Valor inválido.";
    }
  }

  let mensagem = data?.message?.trim();
  if (!mensagem && Object.keys(errosCampo).length > 0) {
    mensagem = "Verifique os campos indicados e tente novamente.";
  }
  if (!mensagem && data?.error?.trim()) {
    mensagem = data.error.trim();
  }
  if (!mensagem) {
    mensagem = MENSAGEM_PADRAO;
  }

  return {
    mensagem,
    errosCampo,
    statusCode: response.status,
  };
}
