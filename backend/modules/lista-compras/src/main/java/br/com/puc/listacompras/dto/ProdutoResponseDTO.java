package br.com.puc.listacompras.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoResponseDTO {

  private Long id;
  private String nome;
  private String nomeNormalizado;
  private BigDecimal preco;
  private Boolean ativo;
  private Boolean isPersonalizado;
  private String tags;
  private CategoriaResponseDTO categoria;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  private String descricao;
  private String unidadeMedida;
}
