package br.com.puc.listacompras.database.repository;

import br.com.puc.listacompras.database.entity.Produto;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

  List<Produto> findByAtivoTrue();

  List<Produto> findByCategoriaIdAndAtivoTrue(Long categoriaId);

  Optional<Produto> findByNomeIgnoreCase(String nome);

  List<Produto> findByNomeContainingIgnoreCaseAndAtivoTrue(String nome);

  List<Produto> findByNomeNormalizadoContainingAndAtivoTrue(String nomeNormalizado);

  List<Produto> findByTagsContainingIgnoreCaseAndAtivoTrue(String tag);

  List<Produto> findTop5ByNomeContainingIgnoreCaseAndAtivoTrue(String nome);

  List<Produto> findByIsPersonalizadoFalseAndAtivoTrue();
}
