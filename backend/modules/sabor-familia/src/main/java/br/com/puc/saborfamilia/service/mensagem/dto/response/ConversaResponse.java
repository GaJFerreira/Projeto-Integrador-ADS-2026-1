package br.com.puc.saborfamilia.service.mensagem.dto.response;

import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResumoResponse;
import java.time.LocalDateTime;

public record ConversaResponse(
  Long id,
  PerfilResumoResponse contato,
  String ultimaMensagem,
  LocalDateTime dataUltimaMensagem,
  Long naoLidas
) {
}
