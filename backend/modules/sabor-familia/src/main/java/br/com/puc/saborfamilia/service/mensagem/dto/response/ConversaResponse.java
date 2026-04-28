package br.com.puc.saborfamilia.service.mensagem.dto.response;

import br.com.puc.saborfamilia.database.entity.ConversaEntity;
import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResumoResponse;
import java.time.LocalDateTime;

public record ConversaResponse(
  Long id,
  PerfilResumoResponse contato,
  String ultimaMensagem,
  LocalDateTime dataUltimaMensagem
) {

  public static ConversaResponse fromResponse(ConversaEntity conversa, Long perfilId) {
    PerfilEntity contato = conversa.getOutroParticipante(perfilId);

    return new ConversaResponse(
      conversa.getId(),
      PerfilResumoResponse.fromEntity(contato),
      conversa.getConteudoUltimaMensagem(),
      conversa.getDataEnvioUltimaMensagem()
    );
  }
}
