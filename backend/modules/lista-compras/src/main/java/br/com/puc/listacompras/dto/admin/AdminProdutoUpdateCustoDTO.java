package br.com.puc.listacompras.dto.admin;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminProdutoUpdateCustoDTO {

  @NotNull(message = "O custo medio e obrigatorio")
  @PositiveOrZero(message = "O custo medio deve ser zero ou positivo")
  private BigDecimal custoMedio;
}
