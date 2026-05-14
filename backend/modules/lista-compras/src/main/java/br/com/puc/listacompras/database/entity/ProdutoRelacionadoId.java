package br.com.puc.listacompras.database.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
public class ProdutoRelacionadoId implements Serializable {

  @Column(name = "produto_id")
  private Long produtoId;

  @Column(name = "similar_id")
  private Long similarId;

  public ProdutoRelacionadoId(Long produtoId, Long similarId) {
    this.produtoId = produtoId;
    this.similarId = similarId;
  }
}
