package br.com.puc.saborfamilia.service.mensagem.publisher;

import br.com.puc.saborfamilia.config.WebSocketConfig;
import br.com.puc.saborfamilia.enums.TipoEventoMensagem;
import br.com.puc.saborfamilia.service.mensagem.dto.response.EventoMensagemWs;
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
    EventoMensagemWs evento = new EventoMensagemWs(
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
    EventoMensagemWs eventoRemetente = new EventoMensagemWs(
      TipoEventoMensagem.APAGADA,
      conversaId,
      mensagem,
      ultimaMensagem,
      dataUltimaMensagem,
      naoLidasRemetente
    );

    EventoMensagemWs eventoDestinatario = new EventoMensagemWs(
      TipoEventoMensagem.APAGADA,
      conversaId,
      mensagem,
      ultimaMensagem,
      dataUltimaMensagem,
      naoLidasDestinatario
    );

    enviarMensagem(remetenteUsuarioId, eventoRemetente);

    if (!remetenteUsuarioId.equals(destinatarioUsuarioId)) {
      enviarMensagem(destinatarioUsuarioId, eventoDestinatario);
    }
  }

  private void publicarEvento(
    Long remetenteUsuarioId,
    Long destinatarioUsuarioId,
    EventoMensagemWs evento
  ) {
    enviarMensagem(remetenteUsuarioId, evento);

    if (!remetenteUsuarioId.equals(destinatarioUsuarioId)) {
      enviarMensagem(destinatarioUsuarioId, evento);
    }
  }

  private void enviarMensagem(Long usuarioId, EventoMensagemWs evento) {
    messagingTemplate.convertAndSendToUser(
      String.valueOf(usuarioId),
      WebSocketConfig.FILA_MENSAGENS,
      evento
    );

    log.debug("Evento publicado para userId={} conversaId={}", usuarioId, evento.conversaId());
  }
}
