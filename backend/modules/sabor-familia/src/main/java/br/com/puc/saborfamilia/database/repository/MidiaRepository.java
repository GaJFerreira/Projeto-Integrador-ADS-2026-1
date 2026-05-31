package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.MidiaEntity;
import br.com.puc.saborfamilia.enums.TipoEntidadeEnum;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MidiaRepository extends JpaRepository<MidiaEntity, Long> {

  Optional<MidiaEntity> findByTipoEntidadeAndEntidadeId(
    TipoEntidadeEnum tipoEntidade,
    Long entidadeId
  );

  List<MidiaEntity> findByTipoEntidadeAndEntidadeIdIn(
    TipoEntidadeEnum tipoEntidade,
    Collection<Long> entidadeIds
  );

}
