package br.com.puc.listacompras.database.entity;

import br.com.puc.listacompras.database.enums.StatusListaEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "lista", schema = "lista_compras")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lista {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /**
   * ID do usuario autenticado na plataforma.
   * Referencia opaca - sem FK fisica entre schemas.
   */
  @Column(name = "usuario_id", nullable = false)
  private Long usuarioId;

  @Column(nullable = false)
  private String titulo;

  @ManyToOne(fetch = FetchType.LAZY, optional = true)
  @JoinColumn(name = "patologia_id")
  private Patologia patologia;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "is_template", nullable = false)
  private Boolean template = false;

  @Transient
  private String descricao;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  private StatusListaEnum status = StatusListaEnum.ABERTA;
}
