package br.pucgo.ads.projetointegrador.carehub.repository;

import br.pucgo.ads.projetointegrador.carehub.entity.Especialidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EspecialidadeRepository extends JpaRepository<Especialidade, Long> {

    Optional<Especialidade> findByNomeIgnoreCase(String nome);

    @Query(value = "SELECT ce.cuidador_id, e.nome " +
                   "FROM care_hub.ch_cuidador_especialidade ce " +
                   "JOIN care_hub.ch_especialidade e ON e.id = ce.especialidade_id " +
                   "WHERE ce.cuidador_id IN (:ids)",
           nativeQuery = true)
    List<Object[]> findNamesByCuidadorIds(@Param("ids") List<Long> ids);
}
