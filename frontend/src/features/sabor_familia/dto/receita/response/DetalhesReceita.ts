import type { TipoRefeicaoEnum } from "../../enums/TipoRefeicaoEnum";

export interface DetalhesReceita {
  titulo: string;
  historia: string | null;
  tipoRefeicao: TipoRefeicaoEnum;
  ingredientes: string;
  modoPreparo: string;
  tempoPreparoMin: number | null;
  qtdPorcoes: number | null;
}
