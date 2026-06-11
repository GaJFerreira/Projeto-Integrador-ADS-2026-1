package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.FeedPerfilReceitaEntity;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedPerfilReceitaRepository extends JpaRepository<FeedPerfilReceitaEntity, Long> {

  @Query(
    value =
    """
      SELECT feed FROM FeedPerfilReceitaEntity feed
      JOIN FETCH feed.receita
      WHERE feed.perfil.id = :perfilId
      ORDER BY feed.dataCadastro DESC
    """,
    countQuery =
    """
      SELECT COUNT(feed)
      FROM FeedPerfilReceitaEntity feed
      WHERE feed.perfil.id = :perfilId
    """
  )
  Page<FeedPerfilReceitaEntity> findByPerfilId(
    @Param("perfilId") Long perfilId,
    Pageable pageable
  );

  @Modifying
  @Query(
    """
      DELETE FROM FeedPerfilReceitaEntity feed
      WHERE feed.perfil.id = :perfilId
      AND feed.receita.perfil.id = :seguidoPerfilId
    """
  )
  void deleteByPerfilIdAndReceitaPerfilId(
    @Param("perfilId") Long perfilId,
    @Param("seguidoPerfilId") Long seguidoPerfilId
  );

  @Modifying
  @Query("DELETE FROM FeedPerfilReceitaEntity feed WHERE feed.receita.id = :receitaId")
  void deleteByReceitaId(@Param("receitaId") Long receitaId);

  @Modifying
  @Query(
    value =
    """
      INSERT INTO sabor_familia.feed_perfil_receita (perfil_id, receita_id, data_cadastro)
      VALUES (:perfilId, :receitaId, :dataCadastro)
      ON CONFLICT (perfil_id, receita_id) DO NOTHING
    """,
    nativeQuery = true
  )
  int insertIgnoringConflicts(
    @Param("perfilId") Long perfilId,
    @Param("receitaId") Long receitaId,
    @Param("dataCadastro") LocalDateTime dataCadastro
  );

}
