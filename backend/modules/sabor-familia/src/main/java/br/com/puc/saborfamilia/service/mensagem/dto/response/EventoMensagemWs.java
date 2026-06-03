package br.com.puc.saborfamilia.service.mensagem.dto.response;

import br.com.puc.saborfamilia.enums.TipoEventoMensagem;
import java.time.LocalDateTime;

public record EventoMensagemWs(
  TipoEventoMensagem tipo,
  Long conversaId,
  MensagemResponse mensagem,
  String ultimaMensagem,
  LocalDateTime dataUltimaMensagem,
  Long naoLidas
) {

}
