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
  name = "usuario_patologias",
  schema = "lista_compras",
  uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "patologia_id"})
)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioPatologia {

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
  @JoinColumn(name = "patologia_id", nullable = false)
  private Patologia patologia;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
}
