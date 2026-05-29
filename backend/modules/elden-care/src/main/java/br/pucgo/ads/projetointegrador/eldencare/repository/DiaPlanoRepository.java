package br.pucgo.ads.projetointegrador.eldencare.repository;

import br.pucgo.ads.projetointegrador.eldencare.domain.ex_dia_plano;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DiaPlanoRepository extends JpaRepository<ex_dia_plano, UUID> {

    // busca os dias de um plano em ordem
    List<ex_dia_plano> findByPlano_IdOrderByDataOuOrdemAsc(UUID planoId);
}
