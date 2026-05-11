package br.com.puc.listacompras.database.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "lista_item", schema = "lista_compras")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemLista {

  @EmbeddedId
  private ItemListaId id;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("listaId")
  @JoinColumn(name = "lista_id", nullable = false)
  private Lista lista;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("produtoId")
  @JoinColumn(name = "produto_id", nullable = false)
  private Produto produto;

  @Column(name = "qtd", precision = 10, scale = 2)
  private BigDecimal quantidade = BigDecimal.ONE;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Transient
  private Boolean comprado = false;
}
