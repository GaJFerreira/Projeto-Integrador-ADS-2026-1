package br.com.puc.saborfamilia.service.receita.dto.response;

import java.time.LocalDateTime;

public record PerfilComentarioResponse(
  Long id,
  Long perfilId,
  String nomePerfil,
  Boolean possuiMidia,
  String comentario,
  LocalDateTime dataComentario
) {
}
