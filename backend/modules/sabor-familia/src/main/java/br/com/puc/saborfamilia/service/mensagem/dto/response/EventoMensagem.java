package br.com.puc.saborfamilia.service.mensagem.dto.response;

public record EventoMensagem(
  Long conversaId,
  MensagemResponse mensagem
) {
}
