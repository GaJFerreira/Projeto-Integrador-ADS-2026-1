package br.com.puc.listacompras.database.repository;

import br.com.puc.listacompras.database.entity.ProdutoRelacionado;
import br.com.puc.listacompras.database.entity.ProdutoRelacionadoId;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoRelacionadoRepository extends JpaRepository<ProdutoRelacionado, ProdutoRelacionadoId> {

  @Query("SELECT pr FROM ProdutoRelacionado pr " +
      "WHERE pr.id.produtoId = :produtoId " +
      "ORDER BY pr.afinidade DESC")
  List<ProdutoRelacionado> findProdutosRelacionados(@Param("produtoId") Long produtoId);

  @Query("SELECT pr FROM ProdutoRelacionado pr " +
      "WHERE pr.id.produtoId = :produtoId " +
      "ORDER BY pr.afinidade DESC")
  List<ProdutoRelacionado> findTopProdutosRelacionados(@Param("produtoId") Long produtoId,
                                                       Pageable pageable);

  boolean existsById_ProdutoIdAndId_SimilarId(Long produtoId, Long similarId);
}
