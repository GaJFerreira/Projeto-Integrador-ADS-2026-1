package br.pucgo.ads.projetointegrador.eldencare.repository;

import br.pucgo.ads.projetointegrador.eldencare.domain.ex_plano;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlanoRepository extends JpaRepository<ex_plano, UUID> {

    // lista os planos de um participante do mais recente para o mais antigo
    List<ex_plano> findByParticipante_IdOrderByMesDesc(UUID participanteId);
}
