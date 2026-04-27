package br.com.puc.saborfamilia.service.receita.dto.request;

import br.com.puc.saborfamilia.annotation.ValidTipoRefeicao;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ReceitaRequest(

  @NotBlank(message = "O título da receita deve ser preenchido.")
  @Schema(description = "Título da receita.", example = "Bolo de Chocolate")
  String titulo,

  @NotNull(message = "O tipo de refeição da receita deve ser preenchido.")
  @Schema(description = "Tipo da refeição para receita.", example = "SOBREMESA")
  @ValidTipoRefeicao
  String tipoRefeicao,

  @NotBlank(message = "Os ingredientes da receita devem ser preenchidos.")
  @Schema(description = "Ingredientes para preparar a receita.", example = "Farinha, ovos, chocolate, açúcar")
  String ingredientes,

  @NotBlank(message = "O modo de preparo da receita deve ser preenchido.")
  @Schema(description = "Modo de preparar a receita.", example = "Misturar tudo e assar por 40 minutos")
  String modoPreparo,

  @Schema(description = "Motivação para aprender e preparar a receita.", example = "Receita da vovó")
  String historia,

  @Min(value = 1, message = "O tempo de preparo da receita deve ser maior que zero.")
  @Schema(description = "Tempo necessário para preparar a receita em minutos.", example = "30")
  Integer tempoPreparoMin,

  @Min(value = 1, message = "A quantidade de porções que a receita rende deve maior que zero.")
  @Schema(description = "Rendimento da receita em porções.", example = "10")
  Integer qtdPorcoes,

  @Schema(description = "Códigos ativos do catálogo (GET /restricao-alimentar)", example = "[\"LACTOSE\", \"GLUTEN\"]")
  List<String> restricoesAlimentares,

  @Schema(description = "Códigos das personalizações de receita.", example = "[\"INGREDIENTES_COMUNS\", \"TRADICIONAL\"]")
  List<String> personalizacoes

) {

}
