export interface EditarRestricaoAlimentarRequest {
  /**
   * Rótulo no contexto do perfil.
   * Ex.: "Sem glúten"
   */
  labelPerfil?: string;

  /**
   * Rótulo no contexto da receita.
   * Ex.: "Contém glúten"
   */
  labelReceita?: string;

  /**
   * Exemplos ilustrativos.
   * Ex.: "trigo, cevada, centeio e derivados"
   */
  exemplos?: string;
}
