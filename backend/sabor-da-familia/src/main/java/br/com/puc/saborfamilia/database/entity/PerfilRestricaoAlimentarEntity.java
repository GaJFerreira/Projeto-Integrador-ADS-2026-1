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
  name = "perfil_restricao_alimentar",
  indexes = @Index(name = "idx_perfil_restricao_perfil_id", columnList = "perfil_id"),
  uniqueConstraints = @UniqueConstraint(
    name = "uk_perfil_restricao_perfil_restricao",
    columnNames = {"perfil_id", "restricao_alimentar_id"}
  )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerfilRestricaoAlimentarEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "perfil_id", nullable = false)
  private PerfilEntity perfil;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "restricao_alimentar_id", nullable = false)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private RestricaoAlimentarEntity restricao;

  @Column(name = "data_cadastro", nullable = false)
  @Builder.Default
  private LocalDateTime dataCadastro = LocalDateTime.now();

}
