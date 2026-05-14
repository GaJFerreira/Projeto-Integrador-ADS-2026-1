package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.SeguindoEntity;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SeguindoRepository extends JpaRepository<SeguindoEntity, Long> {

  boolean existsBySeguidorIdAndSeguidoId(Long seguidorId, Long seguidoId);

  @Modifying
  @Query(
    value =
    """
      INSERT INTO sabor_familia.seguindo (seguidor_id, seguido_id, data_cadastro)
      VALUES (:seguidorId, :seguidoId, :dataCadastro)
      ON CONFLICT (seguidor_id, seguido_id) DO NOTHING
    """,
    nativeQuery = true
  )
  int insertIgnoringConflicts(
    @Param("seguidorId") Long seguidorId,
    @Param("seguidoId") Long seguidoId,
    @Param("dataCadastro") LocalDateTime dataCadastro
  );

  @Modifying
  @Query(
    """
      DELETE FROM SeguindoEntity s
      WHERE s.seguidor.id = :seguidorId
      AND s.seguido.id = :seguidoId
    """
  )
  int deleteBySeguidorIdAndSeguidoId(
    @Param("seguidorId") Long seguidorId,
    @Param("seguidoId") Long seguidoId
  );

  long countBySeguidoId(Long seguidoId);

  long countBySeguidorId(Long seguidorId);

  Page<SeguindoEntity> findBySeguidoIdOrderByDataCadastroDesc(Long seguidoId, Pageable pageable);

  Page<SeguindoEntity> findBySeguidorIdOrderByDataCadastroDesc(Long seguidorId, Pageable pageable);

  @Query(value = "SELECT s.seguidor.id FROM SeguindoEntity s WHERE s.seguido.id = :seguidoId")
  List<Long> findSeguidorIdBySeguidoId(Long seguidoId);

}
