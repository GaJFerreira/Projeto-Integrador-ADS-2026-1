import type { VoltarDestino } from "./voltarDestino";

/** Estado passado entre detalhe da receita, edição e telas de origem. */
export interface ReceitaVoltarState {
  voltarPara: string;
  voltarDestino: VoltarDestino;
  voltarDetalhe?: string;
}

export interface ReceitaEditarLocationState {
  voltarState?: ReceitaVoltarState;
}

export function obterVoltarStateDaRota(
  pathname: string,
  voltarDetalhe?: string
): ReceitaVoltarState {
  if (pathname.includes("/explorar")) {
    return { voltarPara: "/sabor-familia/explorar", voltarDestino: "explorar" };
  }
  if (pathname.includes("/favoritos")) {
    return { voltarPara: "/sabor-familia/favoritos", voltarDestino: "favoritos" };
  }
  const perfilMatch = pathname.match(/\/perfil\/(\d+)/);
  if (perfilMatch) {
    return {
      voltarPara: `/sabor-familia/perfil/${perfilMatch[1]}`,
      voltarDestino: "perfil",
      voltarDetalhe,
    };
  }
  return {
    voltarPara: "/sabor-familia/home",
    voltarDestino: "home",
  };
}

export function resolverVoltarState(
  pathname: string,
  locationState: unknown,
  voltarDetalhe?: string
): ReceitaVoltarState {
  const salvo = (locationState as ReceitaVoltarState | null)?.voltarPara
    ? (locationState as ReceitaVoltarState)
    : null;
  if (salvo?.voltarPara) return salvo;
  return obterVoltarStateDaRota(pathname, voltarDetalhe);
}
