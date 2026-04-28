package br.com.puc.saborfamilia.database.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Index;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
  name = "comentario_receita",
  indexes = {
    @Index(name = "idx_comentario_receita_receita_id", columnList = "receita_id"),
    @Index(name = "idx_comentario_receita_perfil_id", columnList = "perfil_id")
  }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComentarioReceitaEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "receita_id", nullable = false)
  private ReceitaEntity receita;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "perfil_id", nullable = false)
  private PerfilEntity perfil;

  @Column(name = "texto", nullable = false)
  private String texto;

  @Column(name = "data_cadastro", nullable = false)
  private LocalDateTime dataCadastro;

}

