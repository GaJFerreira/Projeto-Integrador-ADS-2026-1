package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.FavoritoReceitaEntity;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FavoritoReceitaRepository extends JpaRepository<FavoritoReceitaEntity, Long> {

  Optional<FavoritoReceitaEntity> findByReceitaIdAndPerfilId(Long receitaId, Long perfilId);

  @Query(
    """
      SELECT favorito.receita.id FROM FavoritoReceitaEntity favorito
      WHERE favorito.perfil.id = :perfilId
      AND favorito.receita.id IN :receitaIds
    """
  )
  List<Long> findReceitaIdsByPerfilIdAndReceitaIdIn(
    @Param("perfilId") Long perfilId,
    @Param("receitaIds") Collection<Long> receitaIds
  );

  @Query(
    value =
    """
      SELECT favorito FROM FavoritoReceitaEntity favorito
      JOIN FETCH favorito.receita receita
      JOIN FETCH receita.perfil
      WHERE favorito.perfil.id = :perfilId
      ORDER BY favorito.dataCadastro DESC
    """,
    countQuery =
    """
      SELECT COUNT(favorito) FROM FavoritoReceitaEntity favorito
      WHERE favorito.perfil.id = :perfilId
    """
  )
  Page<FavoritoReceitaEntity> findByPerfilId(@Param("perfilId") Long perfilId, Pageable pageable);

}
