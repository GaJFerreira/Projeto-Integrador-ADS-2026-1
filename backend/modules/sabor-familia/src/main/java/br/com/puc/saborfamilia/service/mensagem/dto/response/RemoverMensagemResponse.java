package br.com.puc.saborfamilia.service.mensagem.dto.response;

import java.time.LocalDateTime;

public record RemoverMensagemResponse(
  Long conversaId,
  MensagemResponse mensagem,
  String ultimaMensagem,
  LocalDateTime dataUltimaMensagem,
  Long naoLidas
) {
}
