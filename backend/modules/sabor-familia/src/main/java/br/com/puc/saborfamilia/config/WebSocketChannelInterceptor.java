package br.com.puc.saborfamilia.config;

import br.com.puc.saborfamilia.utils.JwtClaimsUtils;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class WebSocketChannelInterceptor implements ChannelInterceptor {

  @Override
  public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
    StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

    if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
      return message;
    }

    String authorization = accessor.getFirstNativeHeader("Authorization");

    if (authorization == null || authorization.isBlank()) {
      log.warn("Conexão via protocolo STOMP recusada: header Authorization ausente.");
      throw new IllegalArgumentException("Authorization ausente.");
    }

    Long userId = JwtClaimsUtils.getUserId(authorization);

    accessor.setUser(new UsernamePasswordAuthenticationToken(
      String.valueOf(userId),
      null,
      List.of()
    ));

    log.debug("Conexão via protocolo STOMP autenticada para userId={}", userId);

    return message;
  }
}
