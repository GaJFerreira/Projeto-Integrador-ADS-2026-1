package br.com.puc.listacompras.database.repository;

import br.com.puc.listacompras.database.entity.Produto;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

  List<Produto> findByAtivoTrue();

  List<Produto> findByCategoriaIdAndAtivoTrue(Long categoriaId);

  Optional<Produto> findByNomeIgnoreCase(String nome);

  List<Produto> findByNomeContainingIgnoreCaseAndAtivoTrue(String nome);

  List<Produto> findByNomeNormalizadoContainingAndAtivoTrue(String nomeNormalizado);

  /**
   * Busca por nome normalizado (sem acentos). Depende da extensao unaccent
   * (criada via funcao publica f_unaccent) configurada no script de massa de dados.
   */
  @Query(
    value = "SELECT * FROM lista_compras.produto " +
            "WHERE public.f_unaccent(nome_normalizado) LIKE public.f_unaccent(CONCAT('%', LOWER(:termo), '%')) " +
            "AND ativo = true",
    nativeQuery = true
  )
  List<Produto> findByNomeNormalizado(@Param("termo") String termo);

  List<Produto> findByTagsContainingIgnoreCaseAndAtivoTrue(String tag);

  List<Produto> findTop5ByNomeContainingIgnoreCaseAndAtivoTrue(String nome);

  List<Produto> findByIsPersonalizadoFalseAndAtivoTrue();
}
