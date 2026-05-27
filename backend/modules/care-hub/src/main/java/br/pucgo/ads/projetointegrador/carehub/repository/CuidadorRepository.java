package br.pucgo.ads.projetointegrador.carehub.repository;

import br.pucgo.ads.projetointegrador.carehub.entity.Cuidador;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório de Cuidadores.
 *
 * <p>
 * <strong>Mudança de arquitetura:</strong> as queries nativas foram atualizadas
 * para referenciar o schema {@code care_hub} explicitamente (ex:
 * {@code care_hub.usuario} em vez de {@code users}), pois a entidade {@link Cuidador}
 * agora persiste em {@code care_hub.ch_cuidador} com FK para {@code care_hub.usuario}.
 *
 * NOTA DE DEPLOY: Arquivo regravado para forçar a detecção de mudança pelo compilador/IDE.
 */
@Repository
public interface CuidadorRepository extends JpaRepository<Cuidador, Long> {

    /** Cuidadores ativos (sem soft-delete). */
    List<Cuidador> findByDeletedAtIsNull();

    boolean existsByUsername(String username);

    Optional<Cuidador> findByUsername(String username);
    Optional<Cuidador> findByEmail(String email);

    Optional<Cuidador> findByPlatformUserId(Long platformUserId);

    // ── JPQL Filters ─────────────────────────────────────────────────────────

    @Query("SELECT c FROM Cuidador c " +
            "WHERE c.deletedAt IS NULL " +
            "AND (:nome IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%',:nome,'%'))) " +
            "AND (:localizacao IS NULL OR c.cidade LIKE CONCAT('%',:localizacao,'%') OR c.estado = :localizacao) " +
            "AND (:especialidade IS NULL OR EXISTS (SELECT 1 FROM c.especialidades se WHERE se.nome LIKE CONCAT('%',:especialidade,'%'))) "
            +
            "AND (:disponibilidade IS NULL OR c.disponibilidade = :disponibilidade)")
    Page<Cuidador> buscarComFiltros(
            @Param("nome") String nome,
            @Param("localizacao") String localizacao,
            @Param("especialidade") String especialidade,
            @Param("disponibilidade") Boolean disponibilidade,
            Pageable pageable);

    // ── Native Queries (schema care_hub explícito) ────────────────────────────

    @Query(value = "SELECT DISTINCT ON (c.id) c.* " +
            "FROM care_hub.ch_cuidador c " +
            "LEFT JOIN care_hub.ch_cuidador_especialidade ce ON c.id = ce.cuidador_id " +
            "LEFT JOIN care_hub.ch_especialidade es ON ce.especialidade_id = es.id " +
            "WHERE c.deleted_at IS NULL " +
            "AND (:nome IS NULL OR c.name ILIKE '%'||:nome||'%') " +
            "AND (:localizacao IS NULL OR (c.estado = :localizacao) OR (c.cidade ILIKE '%'||:localizacao||'%')) " +
            "AND (:especialidade IS NULL OR es.nome ILIKE '%'||:especialidade||'%') " +
            "AND (:disponibilidade IS NULL OR c.disponibilidade = :disponibilidade) " +
            "ORDER BY c.id", countQuery = "SELECT count(DISTINCT c.id) FROM care_hub.ch_cuidador c " +
                    "LEFT JOIN care_hub.ch_cuidador_especialidade ce ON c.id = ce.cuidador_id " +
                    "LEFT JOIN care_hub.ch_especialidade es ON ce.especialidade_id = es.id " +
                    "WHERE c.deleted_at IS NULL " +
                    "AND (:nome IS NULL OR c.name ILIKE '%'||:nome||'%') " +
                    "AND (:localizacao IS NULL OR (c.estado = :localizacao) OR (c.cidade ILIKE '%'||:localizacao||'%')) "
                    +
                    "AND (:especialidade IS NULL OR es.nome ILIKE '%'||:especialidade||'%') " +
                    "AND (:disponibilidade IS NULL OR c.disponibilidade = :disponibilidade)", nativeQuery = true)
    Page<Cuidador> buscarComFiltrosNative(
            @Param("nome") String nome,
            @Param("localizacao") String localizacao,
            @Param("especialidade") String especialidade,
            @Param("disponibilidade") Boolean disponibilidade,
            Pageable pageable);

    // ── Projection queries ────────────────────────────────────────────────────

    @Query(value = "SELECT DISTINCT ON (c.id) " +
            "  c.id as \"id\", c.name as \"name\", c.email as \"email\", c.telefone as \"phone\", " +
            "  c.experiencia as \"experiencia\", c.cidade as \"cidade\", c.estado as \"estado\", " +
            "  c.disponibilidade as \"disponibilidade\", c.taxa_hora as \"taxaHora\", " +
            "  c.avaliacao_media as \"avaliacaoMedia\", c.total_avaliacoes as \"totalAvaliacoes\", " +
            "  c.biografia as \"biografia\", c.foto_perfil as \"fotoPerfil\", " +
            "  c.created_at as \"createdAt\", (c.deleted_at IS NULL) as \"ativo\" " +
            "FROM care_hub.ch_cuidador c " +
            "LEFT JOIN care_hub.ch_cuidador_especialidade ce ON c.id = ce.cuidador_id " +
            "LEFT JOIN care_hub.ch_especialidade es ON ce.especialidade_id = es.id " +
            "WHERE c.deleted_at IS NULL " +
            "AND (:nome IS NULL OR c.name ILIKE '%'||:nome||'%') " +
            "AND (:localizacao IS NULL OR (c.estado = :localizacao) OR (c.cidade ILIKE '%'||:localizacao||'%')) " +
            "AND (:especialidade IS NULL OR es.nome ILIKE '%'||:especialidade||'%') " +
            "AND (:disponibilidade IS NULL OR c.disponibilidade = :disponibilidade) " +
            "ORDER BY c.id, c.avaliacao_media DESC NULLS LAST", countQuery = "SELECT count(DISTINCT c.id) FROM care_hub.ch_cuidador c "
                    +
                    "LEFT JOIN care_hub.ch_cuidador_especialidade ce ON c.id = ce.cuidador_id " +
                    "LEFT JOIN care_hub.ch_especialidade es ON ce.especialidade_id = es.id " +
                    "WHERE c.deleted_at IS NULL " +
                    "AND (:nome IS NULL OR c.name ILIKE '%'||:nome||'%') " +
                    "AND (:localizacao IS NULL OR (c.estado = :localizacao) OR (c.cidade ILIKE '%'||:localizacao||'%')) "
                    +
                    "AND (:especialidade IS NULL OR es.nome ILIKE '%'||:especialidade||'%') " +
                    "AND (:disponibilidade IS NULL OR c.disponibilidade = :disponibilidade)", nativeQuery = true)
    Page<CuidadorProjection> buscarProjectionNative(
            @Param("nome") String nome,
            @Param("localizacao") String localizacao,
            @Param("especialidade") String especialidade,
            @Param("disponibilidade") Boolean disponibilidade,
            Pageable pageable);

    /**
     * Cuidadores sem especialidades cadastradas. */
    @Query("SELECT c FROM Cuidador c WHERE c.especialidades IS EMPTY AND c.deletedAt IS NULL")
    List<Cuidador> findCuidadoresSemEspecialidades();

    /**
     * Cuidadores ativos com especialidades carregadas (evita
     * LazyInitializationException).
     */
    @Query("SELECT DISTINCT c FROM Cuidador c LEFT JOIN FETCH c.especialidades WHERE c.deletedAt IS NULL")
    List<Cuidador> findAllComEspecialidades();

    /**
     * Busca o cuidador vinculado ao cliente por um agendamento ativo
     * (CONFIRMADO ou EM_ANDAMENTO). Se houver mais de um, retorna o mais recente.
     * Usado no momento do recebimento do alerta IoT para popular o campo cuidador
     * diretamente no alerta, eliminando a dependência de JOIN posterior.
     */
    @Query("SELECT ag.cuidador FROM Agendamento ag " +
           "WHERE ag.cliente.id = :clienteId " +
           "AND ag.status IN ('CONFIRMADO', 'EM_ANDAMENTO') " +
           "AND ag.cuidador.deletedAt IS NULL " +
           "ORDER BY ag.dataHoraInicio DESC")
    List<Cuidador> findCuidadoresAtivosDoCliente(@Param("clienteId") Long clienteId);
}

