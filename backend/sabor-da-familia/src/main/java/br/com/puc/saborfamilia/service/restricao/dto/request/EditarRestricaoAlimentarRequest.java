package br.com.puc.saborfamilia.service.restricao.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

public record EditarRestricaoAlimentarRequest(

  @Schema(description = "Rótulo no contexto do perfil.", example = "Sem glúten")
  String labelPerfil,

  @Schema(description = "Rótulo no contexto da receita.", example = "Contém glúten")
  String labelReceita,

  @Schema(description = "Exemplos ilustrativos.", example = "trigo, cevada, centeio e derivados")
  String exemplos

) {

}
