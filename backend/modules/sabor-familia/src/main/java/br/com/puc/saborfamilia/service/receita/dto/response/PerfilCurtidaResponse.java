package br.com.puc.saborfamilia.service.receita.dto.response;

public record PerfilCurtidaResponse(
  Long perfilId,
  String nome,
  Boolean possuiMidia
) {
}
