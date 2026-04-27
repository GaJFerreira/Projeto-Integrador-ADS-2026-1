package br.com.puc.saborfamilia.service.mensagem.dto.response;

import br.com.puc.saborfamilia.database.entity.MensagemEntity;
import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResumoResponse;
import java.time.LocalDateTime;

public record MensagemResponse(
  Long id,
  PerfilResumoResponse perfilRemetente,
  PerfilResumoResponse perfilDestinatario,
  String texto,
  LocalDateTime dataEnvio
) {

  public static MensagemResponse fromEntity(MensagemEntity mensagem) {
    return new MensagemResponse(
      mensagem.getId(),
      PerfilResumoResponse.fromEntity(mensagem.getRemetente()),
      PerfilResumoResponse.fromEntity(mensagem.getDestinatario()),
      mensagem.getTexto(),
      mensagem.getDataEnvio()
    );
  }
}
