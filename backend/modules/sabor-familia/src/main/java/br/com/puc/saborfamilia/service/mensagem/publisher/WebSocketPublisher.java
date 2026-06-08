package br.com.puc.saborfamilia.service.mensagem.publisher;

import br.com.puc.saborfamilia.config.WebSocketConfig;
import br.com.puc.saborfamilia.enums.TipoEventoMensagem;
import br.com.puc.saborfamilia.service.mensagem.dto.response.EventoMensagemWebSocket;
import br.com.puc.saborfamilia.service.mensagem.dto.response.MensagemResponse;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketPublisher {

  private final SimpMessagingTemplate messagingTemplate;

  public void enviarEventoMensagem(
    Long conversaId,
    MensagemResponse mensagem,
    Long remetenteUsuarioId,
    Long destinatarioUsuarioId
  ) {
    EventoMensagemWebSocket evento = new EventoMensagemWebSocket(
      TipoEventoMensagem.NOVA,
      conversaId,
      mensagem,
      mensagem.texto(),
      mensagem.dataEnvio(),
      null
    );

    publicarEvento(remetenteUsuarioId, destinatarioUsuarioId, evento);
  }

  public void enviarEventoMensagemApagada(
    Long conversaId,
    MensagemResponse mensagem,
    String ultimaMensagem,
    LocalDateTime dataUltimaMensagem,
    Long naoLidasRemetente,
    Long naoLidasDestinatario,
    Long remetenteUsuarioId,
    Long destinatarioUsuarioId
  ) {
    EventoMensagemWebSocket eventoRemetente = new EventoMensagemWebSocket(
      TipoEventoMensagem.APAGADA,
      conversaId,
      mensagem,
      ultimaMensagem,
      dataUltimaMensagem,
      naoLidasRemetente
    );

    enviarMensagem(remetenteUsuarioId, eventoRemetente);

    if (!remetenteUsuarioId.equals(destinatarioUsuarioId)) {
      EventoMensagemWebSocket eventoDestinatario = new EventoMensagemWebSocket(
        TipoEventoMensagem.APAGADA,
        conversaId,
        mensagem,
        ultimaMensagem,
        dataUltimaMensagem,
        naoLidasDestinatario
      );

      enviarMensagem(destinatarioUsuarioId, eventoDestinatario);
    }
  }

  private void publicarEvento(
    Long remetenteUsuarioId,
    Long destinatarioUsuarioId,
    EventoMensagemWebSocket evento
  ) {
    enviarMensagem(remetenteUsuarioId, evento);

    if (!remetenteUsuarioId.equals(destinatarioUsuarioId)) {
      enviarMensagem(destinatarioUsuarioId, evento);
    }
  }

  private void enviarMensagem(Long usuarioId, EventoMensagemWebSocket evento) {
    messagingTemplate.convertAndSendToUser(
      String.valueOf(usuarioId),
      WebSocketConfig.FILA_MENSAGENS,
      evento
    );

    log.debug("Evento publicado para userId={} conversaId={}", usuarioId, evento.conversaId());
  }
}
