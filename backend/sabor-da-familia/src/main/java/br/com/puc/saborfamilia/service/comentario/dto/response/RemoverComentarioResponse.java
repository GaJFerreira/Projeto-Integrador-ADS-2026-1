package br.com.puc.saborfamilia.service.comentario.dto.response;

public record RemoverComentarioResponse(
  Long comentarioId,
  boolean removido,
  String motivo
) {
}
