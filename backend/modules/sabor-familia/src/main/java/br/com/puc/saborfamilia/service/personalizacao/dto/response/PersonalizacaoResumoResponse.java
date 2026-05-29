package br.com.puc.saborfamilia.service.personalizacao.dto.response;

import br.com.puc.saborfamilia.enums.CategoriaPersonalizacaoEnum;

public record PersonalizacaoResumoResponse(
  Long id,
  CategoriaPersonalizacaoEnum categoria,
  String codigo,
  String label
) {

}
