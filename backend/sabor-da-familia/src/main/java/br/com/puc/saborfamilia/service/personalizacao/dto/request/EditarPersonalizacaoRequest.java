package br.com.puc.saborfamilia.service.personalizacao.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

public record EditarPersonalizacaoRequest(

  @Schema(description = "Rótulo no contexto do perfil.", example = "Prefiro o preparo prático")
  String labelPerfil,

  @Schema(description = "Rótulo no contexto da receita.", example = "Preparo prático")
  String labelReceita

) {

}
