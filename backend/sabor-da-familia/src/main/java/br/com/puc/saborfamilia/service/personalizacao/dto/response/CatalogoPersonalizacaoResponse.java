package br.com.puc.saborfamilia.service.personalizacao.dto.response;

import java.util.List;

public record CatalogoPersonalizacaoResponse(
  String categoria,
  List<PersonalizacaoResponse> opcoes
) {

}
