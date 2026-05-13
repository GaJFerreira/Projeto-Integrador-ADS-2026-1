package br.com.puc.listacompras.database.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(
  name = "historico_compras",
  schema = "lista_compras",
  uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "produto_a_id", "produto_b_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoricoCompra {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /**
   * ID do usuario autenticado na plataforma.
   * Referencia opaca - sem FK fisica entre schemas.
   */
  @Column(name = "usuario_id", nullable = false)
  private Long usuarioId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produto_a_id", nullable = false)
  private Produto produtoA;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produto_b_id", nullable = false)
  private Produto produtoB;

  @Column(nullable = false)
  private Integer frequencia = 0;

  @Column(nullable = false)
  private Double confianca = 0.0;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
}
