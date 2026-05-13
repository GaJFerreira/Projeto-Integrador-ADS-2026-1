package br.com.puc.listacompras.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ListaItemCreateDTO {

  @NotNull(message = "O ID do produto e obrigatorio")
  private Long produtoId;

  @NotNull(message = "A quantidade e obrigatoria")
  @Min(value = 1, message = "A quantidade minima e 1")
  private Integer qtd;
}
