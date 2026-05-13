package br.com.puc.listacompras.database.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "produto_relacionado", schema = "lista_compras")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoRelacionado {

  @EmbeddedId
  private ProdutoRelacionadoId id;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("produtoId")
  @JoinColumn(name = "produto_id", nullable = false)
  private Produto produto;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("similarId")
  @JoinColumn(name = "similar_id", nullable = false)
  private Produto similar;

  @Column(nullable = false, precision = 6, scale = 4)
  private BigDecimal afinidade = BigDecimal.ZERO;

  @CreationTimestamp
  @Column(name = "atualizado_em")
  private LocalDateTime atualizadoEm;
}
