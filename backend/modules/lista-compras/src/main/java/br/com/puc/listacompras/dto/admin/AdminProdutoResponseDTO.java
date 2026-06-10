package br.com.puc.listacompras.dto.admin;

import br.com.puc.listacompras.dto.CategoriaResponseDTO;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminProdutoResponseDTO {

  private Long id;
  private String nome;
  private String nomeNormalizado;
  private String marca;
  private String unidadeMedida;
  private CategoriaResponseDTO categoria;

  // Custo
  private BigDecimal preco;
  private BigDecimal custoMedio;
  private LocalDateTime custoMedioAtualizadoEm;

  // Nutricional
  private BigDecimal porcaoReferenciaGramas;
  private BigDecimal calorias;
  private BigDecimal proteinas;
  private BigDecimal carboidratos;
  private BigDecimal gordurasTotais;
  private BigDecimal gordurasSaturadas;
  private BigDecimal fibras;
  private BigDecimal sodio;
  private BigDecimal acucares;

  // Metadados
  private String tags;
  private Boolean ativo;
  private Boolean isPersonalizado;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
