package br.pucgo.ads.projetointegrador.carehub.repository;

import br.pucgo.ads.projetointegrador.carehub.entity.Agendamento;
import br.pucgo.ads.projetointegrador.carehub.entity.Agendamento.StatusAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    List<Agendamento> findByCuidadorIdOrderByDataHoraInicioDesc(Long cuidadorId);

    List<Agendamento> findByClienteIdOrderByDataHoraInicioDesc(Long clienteId);

    List<Agendamento> findByCuidadorIdOrderByDataSolicitacaoDesc(Long cuidadorId);

    List<Agendamento> findByClienteIdOrderByDataSolicitacaoDesc(Long clienteId);

    @Query("SELECT a FROM Agendamento a WHERE a.cuidador.id = :cuidadorId " +
           "AND a.dataHoraInicio >= :inicio AND a.dataHoraFim <= :fim " +
           "ORDER BY a.dataHoraInicio")
    List<Agendamento> findByCuidadorAndPeriodo(Long cuidadorId, OffsetDateTime inicio, OffsetDateTime fim);

    @Query("SELECT a FROM Agendamento a WHERE a.cliente.id = :clienteId " +
           "AND a.dataHoraInicio >= :inicio AND a.dataHoraFim <= :fim " +
           "ORDER BY a.dataHoraInicio")
    List<Agendamento> findByClienteAndPeriodo(Long clienteId, OffsetDateTime inicio, OffsetDateTime fim);

    List<Agendamento> findByStatusOrderByDataHoraInicioDesc(StatusAgendamento status);

    @Query("SELECT a FROM Agendamento a WHERE (a.cliente.id = :userId OR a.cuidador.id = :userId) " +
           "AND a.dataHoraInicio >= :inicio AND a.dataHoraInicio <= :fim " +
           "AND a.status IN ('PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO') " +
           "ORDER BY a.dataHoraInicio ASC")
    List<Agendamento> findProximosAgendamentos(Long userId, OffsetDateTime inicio, OffsetDateTime fim);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
           "FROM Agendamento a WHERE a.cuidador.id = :cuidadorId " +
           "AND a.cliente.id = :clienteId " +
           "AND a.dataHoraInicio >= :inicio " +
           "AND a.dataHoraInicio < :fim " +
           "AND a.status IN ('CONFIRMADO', 'EM_ANDAMENTO')")
    boolean existsAgendamentoAtivoHoje(Long cuidadorId, Long clienteId, OffsetDateTime inicio, OffsetDateTime fim);

    /** Retorna true somente se houver agendamento ATIVO entre os usuários (permite envio de mensagens). */
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
           "FROM Agendamento a WHERE ((a.cuidador.id = :user1Id AND a.cliente.id = :user2Id) " +
           "OR (a.cuidador.id = :user2Id AND a.cliente.id = :user1Id)) " +
           "AND a.status IN ('PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO')")
    boolean existsBetweenUsers(Long user1Id, Long user2Id);

    /** Retorna true se já houve QUALQUER agendamento entre os usuários (permite visualizar histórico). */
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
           "FROM Agendamento a WHERE (a.cuidador.id = :user1Id AND a.cliente.id = :user2Id) " +
           "OR (a.cuidador.id = :user2Id AND a.cliente.id = :user1Id)")
    boolean existsAnyBetweenUsers(Long user1Id, Long user2Id);

    @Query("SELECT a FROM Agendamento a " +
           "WHERE a.cliente.id = :clienteId " +
           "AND a.status = 'CONCLUIDO' " +
           "AND NOT EXISTS (SELECT av FROM Avaliacao av WHERE av.agendamento.id = a.id) " +
           "ORDER BY a.dataHoraFim DESC")
    List<Agendamento> findAgendamentosPendentesAvaliacaoByClienteId(Long clienteId);

    @Query("SELECT COUNT(a) FROM Agendamento a " +
           "WHERE a.cliente.id = :clienteId " +
           "AND a.status = 'CONCLUIDO' " +
           "AND NOT EXISTS (SELECT av FROM Avaliacao av WHERE av.agendamento.id = a.id)")
    long countAvaliacoesPendentesByClienteId(Long clienteId);

    @Query("SELECT COUNT(a) FROM Agendamento a WHERE a.cuidador.id = :cuidadorId AND a.status = 'PENDENTE'")
    long countPendentesByCuidadorId(Long cuidadorId);

    @Query("SELECT COUNT(a) FROM Agendamento a WHERE a.cliente.id = :clienteId AND a.status = 'REAGENDADO'")
    long countReagendadosByClienteId(Long clienteId);
}

