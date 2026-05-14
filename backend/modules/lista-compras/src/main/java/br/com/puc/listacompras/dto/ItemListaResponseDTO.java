package br.com.puc.listacompras.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemListaResponseDTO {

  private Long listaId;
  private Long produtoId;
  private ProdutoResponseDTO produto;
  private BigDecimal quantidade;
  private Boolean comprado;
  private LocalDateTime createdAt;
}
