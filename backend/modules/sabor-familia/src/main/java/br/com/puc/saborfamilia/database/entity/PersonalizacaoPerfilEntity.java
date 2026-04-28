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
  name = "personalizacao_perfil",
  indexes = {
    @Index(name = "idx_personalizacao_perfil_perfil_id", columnList = "perfil_id"),
    @Index(name = "idx_personalizacao_perfil_personalizacao_id", columnList = "personalizacao_id")
  },
  uniqueConstraints = @UniqueConstraint(
    name = "uk_personalizacao_perfil_perfil_personalizacao",
    columnNames = {"perfil_id", "personalizacao_id"}
  )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalizacaoPerfilEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "perfil_id", nullable = false)
  private PerfilEntity perfil;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "personalizacao_id", nullable = false)
  private PersonalizacaoEntity personalizacao;

  @Column(name = "data_cadastro", nullable = false)
  private LocalDateTime dataCadastro;

}
