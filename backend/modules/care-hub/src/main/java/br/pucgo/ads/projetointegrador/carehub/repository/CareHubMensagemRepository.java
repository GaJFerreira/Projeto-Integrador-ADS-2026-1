package br.pucgo.ads.projetointegrador.carehub.repository;

import br.pucgo.ads.projetointegrador.carehub.entity.Mensagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CareHubMensagemRepository extends JpaRepository<Mensagem, Long> {

       /** Busca todas as mensagens trocadas entre dois usuários (cronológica ASC). */
       @Query("SELECT m FROM Mensagem m WHERE " +
                     "(m.remetenteId = :usuario1Id AND m.destinatarioId = :usuario2Id) OR " +
                     "(m.remetenteId = :usuario2Id AND m.destinatarioId = :usuario1Id) " +
                     "ORDER BY m.dataEnvio ASC")
       List<Mensagem> findConversaBetween(@Param("usuario1Id") Long usuario1Id,
                     @Param("usuario2Id") Long usuario2Id);

       /**
        * Busca todas as mensagens em que o usuário é remetente ou destinatário (DESC).
        */
       @Query("SELECT m FROM Mensagem m WHERE " +
                     "m.remetenteId = :usuarioId OR m.destinatarioId = :usuarioId " +
                     "ORDER BY m.dataEnvio DESC")
       List<Mensagem> findByRemetenteIdOrDestinatarioIdOrderByDataEnvioDesc(@Param("usuarioId") Long usuarioId);

       /**
        * Busca mensagens não lidas de um destinatário.
        */
       List<Mensagem> findByDestinatarioIdAndLidaFalseOrderByDataEnvioDesc(Long destinatarioId);

       /** Conta mensagens não lidas de um usuário. */
       @Query("SELECT COUNT(m) FROM Mensagem m WHERE m.destinatarioId = :usuarioId AND m.lida = false")
       long countMensagensNaoLidas(@Param("usuarioId") Long usuarioId);

       /** Conta mensagens não lidas de um remetente específico para um usuário. */
       @Query("SELECT COUNT(m) FROM Mensagem m WHERE m.destinatarioId = :usuarioId " +
                     "AND m.remetenteId = :remetenteId AND m.lida = false")
       long countMensagensNaoLidasDeRemetente(@Param("usuarioId") Long usuarioId,
                     @Param("remetenteId") Long remetenteId);

       /** Busca mensagens entre dois usuários ordenadas por data DESC. */
       @Query("SELECT m FROM Mensagem m WHERE " +
                     "(m.remetenteId = :usuario1Id AND m.destinatarioId = :usuario2Id) OR " +
                     "(m.remetenteId = :usuario2Id AND m.destinatarioId = :usuario1Id) " +
                     "ORDER BY m.dataEnvio DESC")
       List<Mensagem> findMensagensEntreOrderByDataEnvioDesc(@Param("usuario1Id") Long usuario1Id,
                     @Param("usuario2Id") Long usuario2Id);

       /** Retorna a última mensagem trocada entre dois usuários, ou null. */
       default Mensagem findUltimaMensagemEntre(Long usuario1Id, Long usuario2Id) {
              List<Mensagem> msgs = findMensagensEntreOrderByDataEnvioDesc(usuario1Id, usuario2Id);
              return (msgs == null || msgs.isEmpty()) ? null : msgs.get(0);
       }

       /**
        * Busca IDs de todos os contatos com quem o usuário já trocou mensagens.
        * Query nativa — já operava sobre colunas, sem mudança necessária.
        */
       @Query(value = "SELECT DISTINCT CASE " +
                     "  WHEN m.remetente_id = :usuarioId THEN m.destinatario_id " +
                     "  ELSE m.remetente_id " +
                     "END " +
                     "FROM care_hub.ch_mensagem m " +
                     "WHERE m.remetente_id = :usuarioId OR m.destinatario_id = :usuarioId", nativeQuery = true)
       List<Long> findContatoIds(@Param("usuarioId") Long usuarioId);

       /** Marca como lidas todas as mensagens de um remetente para um destinatário. */
       @Modifying
       @Query("UPDATE Mensagem m SET m.lida = true " +
                     "WHERE m.destinatarioId = :usuarioId " +
                     "AND m.remetenteId = :remetenteId " +
                     "AND m.lida = false")
       int marcarComoLidas(@Param("usuarioId") Long usuarioId, @Param("remetenteId") Long remetenteId);

       Optional<Mensagem> findByMediaUrl(String mediaUrl);
}
