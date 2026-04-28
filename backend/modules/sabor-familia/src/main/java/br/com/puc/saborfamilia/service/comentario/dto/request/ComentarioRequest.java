package br.com.puc.saborfamilia.service.comentario.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import jakarta.validation.constraints.NotBlank;

public record ComentarioRequest(

  @NotBlank(message = "O comentário deve ser preenchido.")
  @Schema(description = "Comentário a ser registrado na receita.", example = "Receita muito gostosa !")
  String comentario

) {

}
