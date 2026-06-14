import type { TipoRefeicaoEnum } from "../dto/enums/TipoRefeicaoEnum";

export const TIPO_REFEICAO_LABELS: Record<TipoRefeicaoEnum, string> = {
  CAFE_DA_MANHA: "Café da manhã",
  ALMOCO: "Almoço",
  LANCHE: "Lanche",
  JANTAR: "Jantar",
  SOBREMESA: "Sobremesa",
  OUTRO: "Outro",
};

export function labelTipoRefeicao(tipo: TipoRefeicaoEnum | string): string {
  return TIPO_REFEICAO_LABELS[tipo as TipoRefeicaoEnum] ?? tipo;
}

export const TIPOS_REFEICAO = Object.entries(TIPO_REFEICAO_LABELS) as [
  TipoRefeicaoEnum,
  string,
][];
