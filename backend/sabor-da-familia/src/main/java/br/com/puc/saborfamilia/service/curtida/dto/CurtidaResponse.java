package br.com.puc.saborfamilia.service.curtida.dto;

public record CurtidaResponse(
  Long receitaId,
  boolean curtido,
  String motivo
) {
}
