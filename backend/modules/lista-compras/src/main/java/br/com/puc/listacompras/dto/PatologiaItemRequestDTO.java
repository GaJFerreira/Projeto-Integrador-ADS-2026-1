package br.com.puc.listacompras.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatologiaItemRequestDTO {

  @NotNull(message = "O ID da patologia e obrigatorio")
  private Long patologiaId;

  @NotNull(message = "O ID do produto e obrigatorio")
  private Long produtoId;

  private Long produtoSugestaoId;
}
