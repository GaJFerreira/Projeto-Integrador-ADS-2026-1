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
import jakarta.persistence.Transient;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "produto", schema = "lista_compras")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Produto {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String nome;

  @Column(name = "nome_normalizado")
  private String nomeNormalizado;

  // Campo legado: preco original (mantido para nao quebrar contratos publicos).
  // Novos cadastros pelo admin devem priorizar custoMedio.
  @Column(precision = 12, scale = 2)
  private BigDecimal preco;

  // Custo medio de mercado em BRL, gerenciado pelo admin.
  @Column(name = "custo_medio", precision = 12, scale = 2)
  private BigDecimal custoMedio;

  @Column(name = "custo_medio_atualizado_em")
  private LocalDateTime custoMedioAtualizadoEm;

  @Column(name = "marca", length = 120)
  private String marca;

  @Column(name = "unidade_medida", length = 20)
  private String unidadeMedida;

  // Tamanho da porcao de referencia da tabela nutricional (ex: 100, 30).
  @Column(name = "porcao_referencia_gramas", precision = 10, scale = 3)
  private BigDecimal porcaoReferenciaGramas;

  @Column(name = "calorias", precision = 10, scale = 2)
  private BigDecimal calorias;

  @Column(name = "proteinas", precision = 10, scale = 2)
  private BigDecimal proteinas;

  @Column(name = "carboidratos", precision = 10, scale = 2)
  private BigDecimal carboidratos;

  @Column(name = "gorduras_totais", precision = 10, scale = 2)
  private BigDecimal gordurasTotais;

  @Column(name = "gorduras_saturadas", precision = 10, scale = 2)
  private BigDecimal gordurasSaturadas;

  @Column(name = "fibras", precision = 10, scale = 2)
  private BigDecimal fibras;

  @Column(name = "sodio", precision = 10, scale = 2)
  private BigDecimal sodio;

  @Column(name = "acucares", precision = 10, scale = 2)
  private BigDecimal acucares;

  @Column(nullable = false)
  private Boolean ativo = true;

  @Column(name = "is_personalizado", nullable = false)
  private Boolean isPersonalizado = false;

  @Column(name = "tags", columnDefinition = "text")
  private String tags;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  // Campos apenas da API (nao mapeados em coluna)

  @Transient
  private String descricao;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "categoria_id", nullable = false)
  private Categoria categoria;
}
