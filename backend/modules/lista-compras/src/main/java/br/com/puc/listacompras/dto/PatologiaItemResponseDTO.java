package br.com.puc.listacompras.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatologiaItemResponseDTO {

  private Long id;
  private PatologiaResponseDTO patologia;
  private ProdutoResponseDTO produto;
  private ProdutoResponseDTO produtoSugestao;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
