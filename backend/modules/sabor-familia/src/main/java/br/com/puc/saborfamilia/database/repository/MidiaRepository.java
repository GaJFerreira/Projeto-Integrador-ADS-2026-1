package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.MidiaEntity;
import br.com.puc.saborfamilia.enums.TipoEntidadeEnum;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MidiaRepository extends JpaRepository<MidiaEntity, Long> {

  Optional<MidiaEntity> findByTipoEntidadeAndEntidadeId(
    TipoEntidadeEnum tipoEntidade,
    Long entidadeId
  );

  boolean existsByTipoEntidadeAndEntidadeId(TipoEntidadeEnum tipoEntidade, Long entidadeId);

  @Query(
    """
      SELECT m.entidadeId
      FROM MidiaEntity m
      WHERE m.tipoEntidade = :tipoEntidade
      AND m.entidadeId IN :entidadeIds
    """
  )
  List<Long> findEntidadeIdsByTipoEntidadeAndEntidadeIdIn(
    @Param("tipoEntidade") TipoEntidadeEnum tipoEntidade,
    @Param("entidadeIds") Collection<Long> entidadeIds
  );

}
