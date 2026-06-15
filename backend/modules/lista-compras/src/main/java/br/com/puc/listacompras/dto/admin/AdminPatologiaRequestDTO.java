package br.com.puc.listacompras.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminPatologiaRequestDTO {

  @NotBlank(message = "O nome da patologia e obrigatorio.")
  @Size(max = 150, message = "O nome deve ter no maximo 150 caracteres.")
  private String nome;

  @Size(max = 500, message = "A descricao deve ter no maximo 500 caracteres.")
  private String descricao;
}
