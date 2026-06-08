package br.com.puc.listacompras.dto.admin;

import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminProdutoUpdateNutricaoDTO {

  @PositiveOrZero private BigDecimal porcaoReferenciaGramas;
  @PositiveOrZero private BigDecimal calorias;
  @PositiveOrZero private BigDecimal proteinas;
  @PositiveOrZero private BigDecimal carboidratos;
  @PositiveOrZero private BigDecimal gordurasTotais;
  @PositiveOrZero private BigDecimal gordurasSaturadas;
  @PositiveOrZero private BigDecimal fibras;
  @PositiveOrZero private BigDecimal sodio;
  @PositiveOrZero private BigDecimal acucares;
}
