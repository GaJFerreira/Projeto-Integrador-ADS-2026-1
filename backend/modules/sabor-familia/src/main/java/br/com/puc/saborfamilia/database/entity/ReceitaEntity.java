package br.com.puc.saborfamilia.database.entity;

import br.com.puc.saborfamilia.database.enums.TipoRefeicaoEnum;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
  name = "receita",
  schema = "sabor_familia",
  indexes = @Index(name = "idx_receita_perfil_id", columnList = "perfil_id")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceitaEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "titulo", nullable = false)
  private String titulo;

  @Enumerated(EnumType.STRING)
  @Column(name = "tipo_refeicao")
  private TipoRefeicaoEnum tipoRefeicao;

  @Column(name = "ingredientes", columnDefinition = "TEXT", nullable = false)
  private String ingredientes;

  @Column(name = "modo_preparo", columnDefinition = "TEXT", nullable = false)
  private String modoPreparo;

  @Column(name = "historia", columnDefinition = "TEXT")
  private String historia;

  @Column(name = "tempo_preparo_min")
  private Integer tempoPreparoMin;

  @Column(name = "qtd_porcoes")
  private Integer qtdPorcoes;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "perfil_id", nullable = false)
  private PerfilEntity perfil;

  @OneToMany(mappedBy = "receita")
  @Builder.Default
  private List<ReceitaRestricaoAlimentarEntity> restricoesAlimentares = new ArrayList<>();

  @OneToMany(mappedBy = "receita")
  @Builder.Default
  private List<PersonalizacaoReceitaEntity> personalizacoes = new ArrayList<>();

  @Column(name = "count_curtidas", nullable = false)
  @Builder.Default
  private Integer countCurtidas = 0;

  @Column(name = "count_comentarios", nullable = false)
  @Builder.Default
  private Integer countComentarios = 0;

  @Column(name = "data_cadastro", nullable = false)
  private LocalDateTime dataCadastro;

  @Column(name = "ultima_atualizacao", nullable = false)
  private LocalDateTime ultimaAtualizacao;

}

