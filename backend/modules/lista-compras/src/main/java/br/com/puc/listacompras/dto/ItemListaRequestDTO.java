package br.com.puc.listacompras.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemListaRequestDTO {

  @NotNull
  private Long listaId;

  @NotNull
  private Long produtoId;

  @NotNull(message = "A quantidade e obrigatoria")
  @Positive(message = "A quantidade deve ser maior que zero")
  private BigDecimal quantidade;

  private Boolean comprado = false;
}
