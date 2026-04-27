package br.com.puc.saborfamilia.database.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
  name = "seguindo",
  indexes = {
    @Index(name = "idx_seguindo_seguidor_id", columnList = "seguidor_id"),
    @Index(name = "idx_seguindo_seguido_id", columnList = "seguido_id")
  },
  uniqueConstraints = @UniqueConstraint(
    name = "uk_seguindo_seguidor_seguido",
    columnNames = {"seguidor_id", "seguido_id"}
  )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeguindoEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "seguidor_id", nullable = false)
  private PerfilEntity seguidor;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "seguido_id", nullable = false)
  private PerfilEntity seguido;

  @Column(name = "data_cadastro", nullable = false)
  private LocalDateTime dataCadastro;

}
