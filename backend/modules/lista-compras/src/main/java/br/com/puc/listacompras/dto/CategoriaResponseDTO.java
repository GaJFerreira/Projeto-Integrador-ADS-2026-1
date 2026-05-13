package br.com.puc.listacompras.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoriaResponseDTO {

  private Long id;
  private String nome;
  private String descricao;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
