package br.com.puc.listacompras.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListaRequestDTO {

  @NotBlank(message = "O titulo da lista e obrigatorio")
  @Size(max = 200, message = "O titulo deve ter no maximo 200 caracteres")
  private String titulo;

  private Boolean template = false;

  @Size(max = 500, message = "A descricao deve ter no maximo 500 caracteres")
  private String descricao;
}
