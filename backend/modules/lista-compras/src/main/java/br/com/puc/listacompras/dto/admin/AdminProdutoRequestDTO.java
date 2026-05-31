package br.com.puc.listacompras.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminProdutoRequestDTO {

  @NotBlank(message = "O nome do produto e obrigatorio")
  @Size(max = 150, message = "O nome deve ter no maximo 150 caracteres")
  private String nome;

  @NotNull(message = "O ID da categoria e obrigatorio")
  private Long categoriaId;

  @Size(max = 120, message = "A marca deve ter no maximo 120 caracteres")
  private String marca;

  @Size(max = 20, message = "A unidade de medida deve ter no maximo 20 caracteres (ex: g, kg, ml, un)")
  private String unidadeMedida;

  @PositiveOrZero(message = "O custo medio deve ser zero ou positivo")
  private BigDecimal custoMedio;

  // Tabela nutricional (todos opcionais para permitir cadastros parciais)
  @PositiveOrZero
  private BigDecimal porcaoReferenciaGramas;

  @PositiveOrZero private BigDecimal calorias;
  @PositiveOrZero private BigDecimal proteinas;
  @PositiveOrZero private BigDecimal carboidratos;
  @PositiveOrZero private BigDecimal gordurasTotais;
  @PositiveOrZero private BigDecimal gordurasSaturadas;
  @PositiveOrZero private BigDecimal fibras;
  @PositiveOrZero private BigDecimal sodio;
  @PositiveOrZero private BigDecimal acucares;

  @Size(max = 500, message = "As tags devem ter no maximo 500 caracteres")
  private String tags;

  private Boolean ativo = true;
}
