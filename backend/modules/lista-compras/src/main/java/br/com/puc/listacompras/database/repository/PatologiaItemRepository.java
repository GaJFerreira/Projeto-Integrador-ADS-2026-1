package br.com.puc.listacompras.database.repository;

import br.com.puc.listacompras.database.entity.PatologiaItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PatologiaItemRepository extends JpaRepository<PatologiaItem, Long> {

  List<PatologiaItem> findByPatologiaId(Long patologiaId);

  List<PatologiaItem> findByProdutoId(Long produtoId);

  boolean existsByPatologiaIdAndProdutoId(Long patologiaId, Long produtoId);

  Optional<PatologiaItem> findByPatologiaIdAndProdutoId(Long patologiaId, Long produtoId);

  /**
   * Verifica se um produto deve ser alertado para o usuario com base em alguma
   * patologia que ele possua.
   */
  @Query("""
      SELECT CASE WHEN COUNT(pi) > 0 THEN true ELSE false END
      FROM PatologiaItem pi
      JOIN UsuarioPatologia up ON up.patologia.id = pi.patologia.id
      WHERE up.usuarioId = :usuarioId AND pi.produto.id = :produtoId
  """)
  boolean produtoDeveSerAlertado(@Param("usuarioId") Long usuarioId,
                                 @Param("produtoId") Long produtoId);

  @Query("""
      SELECT pi FROM PatologiaItem pi
      JOIN UsuarioPatologia up ON up.patologia.id = pi.patologia.id
      WHERE up.usuarioId = :usuarioId AND pi.produto.id = :produtoId
  """)
  List<PatologiaItem> findPatologiasQueRestringemProdutoParaUsuario(
      @Param("usuarioId") Long usuarioId,
      @Param("produtoId") Long produtoId);

  /**
   * Busca os PatologiaItem com produto_sugestao_id preenchido para o produto e
   * para alguma patologia do usuario.
   */
  @Query("""
      SELECT pi FROM PatologiaItem pi
      JOIN UsuarioPatologia up ON up.patologia.id = pi.patologia.id
      WHERE up.usuarioId = :usuarioId
        AND pi.produto.id = :produtoId
        AND pi.produtoSugestao IS NOT NULL
  """)
  List<PatologiaItem> findProdutosSubstituiveis(
      @Param("usuarioId") Long usuarioId,
      @Param("produtoId") Long produtoId);

  @Query("""
      SELECT pi
      FROM PatologiaItem pi
      WHERE pi.patologia.id = :patologiaId
        AND pi.produto.id = :produtoId
  """)
  List<PatologiaItem> findProdutosSubstituiveisPorPatologia(
      @Param("patologiaId") Long patologiaId,
      @Param("produtoId") Long produtoId);
}
