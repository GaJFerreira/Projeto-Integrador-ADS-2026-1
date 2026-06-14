package br.pucgo.ads.projetointegrador.dosecerta.database.repository;

import br.pucgo.ads.projetointegrador.dosecerta.database.entity.RegistroTomada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RegistroTomadaRepository extends JpaRepository<RegistroTomada, Long> {

    // Todas as tomadas ordenadas
    List<RegistroTomada> findByMedicamentoIdOrderByDataPrevistaAscHorarioPrevistoAsc(Long medicamentoId);

    // Tomadas previstas em um dia específico
    List<RegistroTomada> findByMedicamentoIdAndDataPrevista(Long medicamentoId, LocalDate dataPrevista);

    // Buscar registros de um usuário
    List<RegistroTomada> findByPlatformUserId(Long platformUserId);

    // Buscar apenas registros atrasados (minutos de atraso > 0)
    List<RegistroTomada> findByPlatformUserIdAndAtrasoMinutosGreaterThan(Long platformUserId, Integer atrasoMinutos);

    // Tomadas atrasadas de um medicamento
    List<RegistroTomada> findByMedicamentoIdAndAtrasoMinutosGreaterThan(Long medicamentoId, Integer atrasoMinutos);

    // Lista do dia ordenada por horário previsto
    List<RegistroTomada> findByMedicamentoIdAndDataPrevistaOrderByHorarioPrevistoAsc(Long medicamentoId, LocalDate dataPrevista);

    void deleteByPlatformUserId(Long platformUserId);

}
