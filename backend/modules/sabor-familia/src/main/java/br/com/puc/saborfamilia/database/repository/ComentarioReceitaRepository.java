package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.ComentarioReceitaEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ComentarioReceitaRepository extends JpaRepository<ComentarioReceitaEntity, Long> {

  @Query(
    """
      SELECT comentario FROM ComentarioReceitaEntity comentario
      JOIN FETCH comentario.perfil
      WHERE comentario.receita.id = :receitaId
      ORDER BY comentario.dataCadastro ASC
    """
  )
  List<ComentarioReceitaEntity> findByReceitaIdWithPerfil(@Param("receitaId") Long receitaId);

  @Query(
    value =
    """
      SELECT * FROM comentario_receita comentario
      WHERE comentario.perfil_id = :perfilId
      AND comentario.receita_id = :receitaId
      ORDER BY comentario.data_cadastro DESC LIMIT 1
    """,
    nativeQuery = true
  )
  ComentarioReceitaEntity findUltimoComentario(Long perfilId, Long receitaId);

  Optional<ComentarioReceitaEntity> findByIdAndReceitaId(Long comentarioId, Long receitaId);

}


