package br.com.puc.saborfamilia.service.mensagem.dto.response;

import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResumoResponse;
import java.time.LocalDateTime;

public record MensagemResponse(
  Long id,
  PerfilResumoResponse perfilRemetente,
  PerfilResumoResponse perfilDestinatario,
  String texto,
  LocalDateTime dataEnvio
) {
}
