package br.com.puc.saborfamilia.database.entity;

import br.com.puc.saborfamilia.enums.StatusEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
  name = "restricao_alimentar",
  schema = "sabor_familia",
  indexes = @Index(name = "idx_restricao_alimentar_status", columnList = "status"),
  uniqueConstraints = @UniqueConstraint(name = "uk_restricao_alimentar_codigo", columnNames = "codigo")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestricaoAlimentarEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "codigo", nullable = false)
  private String codigo;

  @Column(name = "label_perfil", nullable = false)
  private String labelPerfil;

  @Column(name = "label_receita", nullable = false)
  private String labelReceita;

  @Column(name = "exemplos")
  private String exemplos;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private StatusEnum status;

  @Column(name = "data_cadastro", nullable = false)
  private LocalDateTime dataCadastro;

  @Column(name = "ultima_atualizacao", nullable = false)
  private LocalDateTime ultimaAtualizacao;

}
