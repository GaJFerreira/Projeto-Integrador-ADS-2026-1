package br.com.puc.listacompras.database.repository;

import br.com.puc.listacompras.database.entity.ItemLista;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemListaRepository extends JpaRepository<ItemLista, Long> {

  List<ItemLista> findById_ListaId(Long listaId);

  Optional<ItemLista> findById_ListaIdAndId_ProdutoId(Long listaId, Long produtoId);

  boolean existsById_ListaIdAndId_ProdutoId(Long listaId, Long produtoId);

  void deleteById_ListaIdAndId_ProdutoId(Long listaId, Long produtoId);

  @Query("""
      SELECT i FROM ItemLista i
      JOIN i.lista l
      WHERE l.usuarioId = :usuarioId
        AND l.status = br.com.puc.listacompras.database.enums.StatusListaEnum.FINALIZADA
  """)
  List<ItemLista> findItensByUsuarioFinalizados(@Param("usuarioId") Long usuarioId);

  @Query("SELECT COUNT(i) FROM ItemLista i WHERE i.id.listaId = :listaId")
  long countByListaId(@Param("listaId") Long listaId);
}
