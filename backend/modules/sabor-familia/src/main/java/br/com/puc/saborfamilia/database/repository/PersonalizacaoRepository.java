package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.PersonalizacaoEntity;
import br.com.puc.saborfamilia.enums.StatusEnum;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonalizacaoRepository extends JpaRepository<PersonalizacaoEntity, Long> {

  Optional<PersonalizacaoEntity> findByCodigoIgnoreCase(String codigo);

  List<PersonalizacaoEntity> findByCodigoIn(Collection<String> codigos);

  List<PersonalizacaoEntity> findByStatus(StatusEnum status);

}
