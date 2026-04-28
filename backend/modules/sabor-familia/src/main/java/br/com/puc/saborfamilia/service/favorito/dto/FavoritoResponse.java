package br.com.puc.saborfamilia.service.favorito.dto;

public record FavoritoResponse(
  Long receitaId,
  boolean favoritado,
  String motivo
) {
}
