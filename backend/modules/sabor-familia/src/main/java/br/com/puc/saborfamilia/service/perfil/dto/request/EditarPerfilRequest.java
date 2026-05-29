package br.com.puc.saborfamilia.service.perfil.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record EditarPerfilRequest(

  @Schema(description = "Biografia de perfil do usuário.", example = "Adoro cozinhar na companhia de amigos.")
  String bio,

  @Schema(description = "Códigos ativos do catálogo (GET /restricao-alimentar).", example = "[\"SOJA\", \"ACUCAR\"]")
  List<String> restricoesAlimentares,

  @Schema(description = "Códigos das personalizações de perfil.", example = "[\"INGREDIENTES_COMUNS\", \"TRADICIONAL\"]")
  List<String> personalizacoes

) {

}
