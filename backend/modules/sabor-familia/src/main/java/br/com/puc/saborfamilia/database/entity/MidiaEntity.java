package br.com.puc.saborfamilia.database.entity;

import br.com.puc.saborfamilia.enums.TipoEntidadeEnum;
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
  name = "midia",
  schema = "sabor_familia",
  indexes = @Index(
    name = "idx_midia_tipo_entidade",
    columnList = "tipo_entidade, entidade_id"
  ),
  uniqueConstraints = @UniqueConstraint(
    name = "uk_midia_tipo_entidade",
    columnNames = {"tipo_entidade", "entidade_id"}
  )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MidiaEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(name = "tipo_entidade", nullable = false, length = 20)
  private TipoEntidadeEnum tipoEntidade;

  @Column(name = "entidade_id", nullable = false)
  private Long entidadeId;

  @Column(name = "content_type", nullable = false, length = 100)
  private String contentType;

  @Column(name = "caminho_relativo", nullable = false, length = 500)
  private String caminhoRelativo;

  @Column(name = "tamanho_bytes", nullable = false)
  private Long tamanhoBytes;

  @Column(name = "data_cadastro", nullable = false)
  private LocalDateTime dataCadastro;

  @Column(name = "ultima_atualizacao", nullable = false)
  private LocalDateTime ultimaAtualizacao;

}
