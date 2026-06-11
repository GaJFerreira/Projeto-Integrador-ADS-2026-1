export interface EnviarMensagemRequest {
  /**
   * ID do perfil de destino da mensagem.
   * Ex.: 1
   */
  destinatarioId: number;

  /**
   * Conteúdo da mensagem.
   * Ex.: "Bom dia, tudo bem ?"
   */
  mensagem: string;
}
