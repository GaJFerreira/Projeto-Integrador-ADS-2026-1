package br.com.puc.saborfamilia.service.mensagem.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EnviarMensagemRequest(

  @NotNull(message = "O ID do perfil de destino da mensagem deve ser preenchido.")
  @Schema(description = "ID do perfil de destino da mensagem.", example = "1")
  Long destinatarioId,

  @NotBlank(message = "O conteúdo da mensagem deve ser preenchido.")
  @Schema(description = "Conteúdo da mensagem.", example = "Bom dia, tudo bem ?")
  String mensagem

) {

}
