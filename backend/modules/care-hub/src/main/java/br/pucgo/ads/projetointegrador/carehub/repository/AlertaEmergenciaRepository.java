package br.pucgo.ads.projetointegrador.carehub.repository;

import br.pucgo.ads.projetointegrador.carehub.entity.AlertaEmergencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertaEmergenciaRepository extends JpaRepository<AlertaEmergencia, Long> {
    List<AlertaEmergencia> findByCliente_IdOrderByCriadoEmDesc(Long clienteId);
    List<AlertaEmergencia> findByCliente_IdAndStatusOrderByCriadoEmDesc(Long clienteId, String status);
}
