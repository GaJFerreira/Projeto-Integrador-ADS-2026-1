package br.pucgo.ads.projetointegrador.carehub.repository;

import br.pucgo.ads.projetointegrador.carehub.entity.AlertaEmergencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertaEmergenciaRepository extends JpaRepository<AlertaEmergencia, Long> {

    // ── Consultas por Cliente (idoso vê seus próprios alertas) ─────────────────
    List<AlertaEmergencia> findByCliente_IdOrderByCriadoEmDesc(Long clienteId);
    List<AlertaEmergencia> findByCliente_IdAndStatusOrderByCriadoEmDesc(Long clienteId, String status);

    // ── Consultas por Cuidador (via FK direta — sem JOIN com Agendamento) ──────
    // A FK cuidador_id é preenchida no momento do recebimento do alerta,
    // eliminando a dependência de existir um Agendamento para o cuidador ver o alerta.
    List<AlertaEmergencia> findByCuidador_IdOrderByCriadoEmDesc(Long cuidadorId);
    List<AlertaEmergencia> findByCuidador_IdAndStatusOrderByCriadoEmDesc(Long cuidadorId, String status);
}
