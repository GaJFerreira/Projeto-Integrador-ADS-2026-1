export interface EditarPersonalizacaoRequest {
  /**
   * Rótulo no contexto do perfil.
   * Ex.: "Prefiro o preparo prático"
   */
  labelPerfil?: string;

  /**
   * Rótulo no contexto da receita.
   * Ex.: "Preparo prático"
   */
  labelReceita?: string;
}
