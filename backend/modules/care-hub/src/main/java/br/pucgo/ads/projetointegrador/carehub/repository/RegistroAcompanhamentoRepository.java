package br.pucgo.ads.projetointegrador.carehub.repository;

import br.pucgo.ads.projetointegrador.carehub.entity.RegistroAcompanhamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroAcompanhamentoRepository extends JpaRepository<RegistroAcompanhamento, Long> {

    List<RegistroAcompanhamento> findByCliente_PlatformUserIdOrderByDataHoraRegistroDesc(Long clientePlatformId);

    List<RegistroAcompanhamento> findByCuidador_PlatformUserIdOrderByDataHoraRegistroDesc(Long cuidadorPlatformId);

    List<RegistroAcompanhamento> findByAgendamentoIdOrderByDataHoraRegistroDesc(Long agendamentoId);

    List<RegistroAcompanhamento> findByAgendamentoId(Long agendamentoId);

    boolean existsByAgendamentoId(Long agendamentoId);
}
