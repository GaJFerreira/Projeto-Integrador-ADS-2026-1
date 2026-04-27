package br.com.puc.saborfamilia.service.mensagem.dto.response;

public record EnviarMensagemResponse(
  Long conversaId,
  MensagemResponse mensagem
) {

}
