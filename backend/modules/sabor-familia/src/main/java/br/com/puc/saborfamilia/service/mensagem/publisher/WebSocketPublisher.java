package br.com.puc.saborfamilia.service.mensagem.publisher;

import br.com.puc.saborfamilia.config.WebSocketConfig;
import br.com.puc.saborfamilia.service.mensagem.dto.response.MensagemResponse;
import br.com.puc.saborfamilia.service.mensagem.dto.response.EventoMensagem;
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
    EventoMensagem evento = new EventoMensagem(conversaId, mensagem);

    enviarMensagem(remetenteUsuarioId, evento);

    if (!remetenteUsuarioId.equals(destinatarioUsuarioId)) {
      enviarMensagem(destinatarioUsuarioId, evento);
    }
  }

  private void enviarMensagem(Long usuarioId, EventoMensagem evento) {
    messagingTemplate.convertAndSendToUser(
      String.valueOf(usuarioId),
      WebSocketConfig.FILA_MENSAGENS,
      evento
    );

    log.debug("Evento publicado para userId={} conversaId={}", usuarioId, evento.conversaId());
  }
}
