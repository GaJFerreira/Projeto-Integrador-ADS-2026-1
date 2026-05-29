package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.MensagemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MensagemRepository extends JpaRepository<MensagemEntity, Long> {

  @Query(
    value =
    """
      SELECT mensagem FROM MensagemEntity mensagem
      JOIN FETCH mensagem.remetente
      JOIN FETCH mensagem.destinatario
      WHERE mensagem.conversa.id = :conversaId
    """,
    countQuery =
    """
      SELECT COUNT(mensagem) FROM MensagemEntity mensagem
      WHERE mensagem.conversa.id = :conversaId
    """
  )
  Page<MensagemEntity> findUltimasMensagens(
    @Param("conversaId") Long conversaId,
    Pageable pageable
  );

  @Query(
    value =
    """
      SELECT mensagem FROM MensagemEntity mensagem
      JOIN FETCH mensagem.remetente
      JOIN FETCH mensagem.destinatario
      WHERE mensagem.conversa.id = :conversaId AND mensagem.id < :beforeId
    """,
    countQuery =
    """
      SELECT COUNT(mensagem) FROM MensagemEntity mensagem
      WHERE mensagem.conversa.id = :conversaId
      AND mensagem.id < :beforeId
    """
  )
  Page<MensagemEntity> findUltimasMensagensAnteriores(
    @Param("conversaId") Long conversaId,
    @Param("beforeId") Long beforeId,
    Pageable pageable
  );

}
