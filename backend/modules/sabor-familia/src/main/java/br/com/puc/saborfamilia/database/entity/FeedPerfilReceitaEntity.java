package br.com.puc.saborfamilia.database.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
  name = "feed_perfil_receita",
  indexes = {
    @Index(name = "idx_feed_perfil_receita_perfil_data", columnList = "perfil_id, data_cadastro"),
    @Index(name = "idx_feed_perfil_receita_receita_id", columnList = "receita_id")
  },
  uniqueConstraints = @UniqueConstraint(
    name = "uk_feed_perfil_receita_perfil_receita",
    columnNames = {"perfil_id", "receita_id"}
  )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedPerfilReceitaEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "perfil_id", nullable = false)
  private PerfilEntity perfil;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "receita_id", nullable = false)
  private ReceitaEntity receita;

  @Column(name = "data_cadastro", nullable = false)
  private LocalDateTime dataCadastro;
}
