package br.com.puc.listacompras.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoriaRequestDTO {

  @NotBlank(message = "O nome da categoria e obrigatorio")
  @Size(max = 100)
  private String nome;

  @Size(max = 255)
  private String descricao;
}
