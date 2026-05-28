import { diaAnterior, mesmoDia, parseDataApi } from "./dateUtils";

export function formatarTempo(value: string): string {
  const date = parseDataApi(value);
  if (!date) return "";

  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function formatHora(value: string): string {
  const date = parseDataApi(value);
  if (!date) return "";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatData(value: string): string {
  const date = parseDataApi(value);
  if (!date) return "";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/** Cards em grid (explorar, favoritos, perfil): hoje / ontem / data curta. */
export function formatDataGrid(value: string): string {
  const date = parseDataApi(value);
  if (!date) return "";

  const hoje = new Date();
  if (mesmoDia(date, hoje)) return "hoje";
  if (mesmoDia(date, diaAnterior(hoje))) return "ontem";
  return formatData(value);
}

/** Data e hora completas nos detalhes da receita. */
export function formatDataPublicacaoCompleta(value: string): string {
  const date = parseDataApi(value);
  if (!date) return "";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Data + hora para mensagens; no mesmo dia mostra só a hora. */
export function formatDataHora(value: string): string {
  const date = parseDataApi(value);
  if (!date) return "";

  const hoje = new Date();
  if (mesmoDia(date, hoje)) {
    return formatHora(value);
  }

  return `${formatData(value)} · ${formatHora(value)}`;
}
