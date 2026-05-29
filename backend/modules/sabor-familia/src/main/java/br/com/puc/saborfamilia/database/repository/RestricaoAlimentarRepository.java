package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.RestricaoAlimentarEntity;
import br.com.puc.saborfamilia.enums.StatusEnum;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestricaoAlimentarRepository extends JpaRepository<RestricaoAlimentarEntity, Long> {

  Optional<RestricaoAlimentarEntity> findByCodigoIgnoreCase(String codigo);

  List<RestricaoAlimentarEntity> findByStatus(StatusEnum status);

  List<RestricaoAlimentarEntity> findByCodigoInAndStatus(Collection<String> codigos, StatusEnum status);

}
