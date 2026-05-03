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
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
  name = "receita_restricao_alimentar",
  schema = "sabor_familia",
  indexes = {
    @Index(name = "idx_receita_restricao_receita_id", columnList = "receita_id"),
    @Index(name = "idx_receita_restricao_restricao_id", columnList = "restricao_alimentar_id")
  },
  uniqueConstraints = @UniqueConstraint(
    name = "uk_receita_restricao_receita_restricao",
    columnNames = {"receita_id", "restricao_alimentar_id"}
  )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceitaRestricaoAlimentarEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "receita_id", nullable = false)
  private ReceitaEntity receita;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "restricao_alimentar_id", nullable = false)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private RestricaoAlimentarEntity restricao;

  @Column(name = "data_cadastro", nullable = false)
  private LocalDateTime dataCadastro;

}
