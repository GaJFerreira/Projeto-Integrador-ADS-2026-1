export interface ReceitaRequest {
  /**
   * Título da receita.
   * Ex.: "Bolo de Chocolate"
   */
  titulo: string;

  /**
   * Tipo da refeição para receita.
   * Ex.: "SOBREMESA"
   */
  tipoRefeicao: string;

  /**
   * Ingredientes para preparar a receita.
   * Ex.: "Farinha, ovos, chocolate, açúcar"
   */
  ingredientes: string;

  /**
   * Modo de preparar a receita.
   * Ex.: "Misturar tudo e assar por 40 minutos"
   */
  modoPreparo: string;

  /**
   * Motivação para aprender e preparar a receita.
   * Ex.: "Receita da vovó"
   */
  historia?: string;

  /**
   * Tempo necessário para preparar a receita em minutos.
   * Ex.: 30
   */
  tempoPreparoMin?: number;

  /**
   * Rendimento da receita em porções.
   * Ex.: 10
   */
  qtdPorcoes?: number;

  /**
   * Códigos ativos do catálogo (GET /restricao-alimentar).
   * Ex.: ["LACTOSE", "GLUTEN"]
   */
  restricoesAlimentares?: string[];

  /**
   * Códigos das personalizações de receita.
   * Ex.: ["INGREDIENTES_COMUNS", "TRADICIONAL"]
   */
  personalizacoes?: string[];
}
