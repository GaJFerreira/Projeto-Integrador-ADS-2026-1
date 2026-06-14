package br.com.puc.saborfamilia.service.personalizacao.dto.response;

import br.com.puc.saborfamilia.enums.CategoriaPersonalizacaoEnum;
import br.com.puc.saborfamilia.enums.StatusEnum;

public record PersonalizacaoResponse(
    Long id,
    CategoriaPersonalizacaoEnum categoria,
    String codigo,
    String labelPerfil,
    String labelReceita,
    StatusEnum status
) {

}