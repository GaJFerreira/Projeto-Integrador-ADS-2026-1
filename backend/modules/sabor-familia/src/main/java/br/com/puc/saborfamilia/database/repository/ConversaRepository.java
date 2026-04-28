package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.ConversaEntity;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversaRepository extends JpaRepository<ConversaEntity, Long> {

  @Query(
    value = 
    """
      SELECT conversa FROM ConversaEntity conversa
      JOIN FETCH conversa.primeiroParticipante
      JOIN FETCH conversa.segundoParticipante
      WHERE conversa.primeiroParticipante.id = :perfilId OR conversa.segundoParticipante.id = :perfilId
      ORDER BY conversa.dataEnvioUltimaMensagem DESC
    """,
    countQuery = 
    """
      SELECT COUNT(conversa) FROM ConversaEntity conversa
      WHERE conversa.primeiroParticipante.id = :perfilId OR conversa.segundoParticipante.id = :perfilId
    """
  )
  Page<ConversaEntity> findByParticipanteIdOrderByDataEnvioUltimaMensagemDesc(
    @Param("perfilId") Long perfilId,
    Pageable pageable
  );
  
  @Query(
    """
      SELECT conversa FROM ConversaEntity conversa
      JOIN FETCH conversa.primeiroParticipante
      JOIN FETCH conversa.segundoParticipante
      WHERE conversa.primeiroParticipante.id = :primeiroParticipanteId
      AND conversa.segundoParticipante.id = :segundoParticipanteId
    """
  )
  Optional<ConversaEntity> findByParticipantesConversa(
    @Param("primeiroParticipanteId") Long primeiroParticipanteId,
    @Param("segundoParticipanteId") Long segundoParticipanteId
  );

}
