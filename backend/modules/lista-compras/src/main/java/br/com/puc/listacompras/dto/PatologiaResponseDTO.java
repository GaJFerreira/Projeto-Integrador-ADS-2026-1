package br.com.puc.listacompras.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatologiaResponseDTO {
  private Long id;
  private String nome;
  private String descricao;
}
