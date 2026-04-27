package br.com.puc.saborfamilia.service.receita.dto.response;

public record RemoverReceitaResponse(
  Long id,
  boolean removida,
  String motivo
) {
}

