package br.com.puc.saborfamilia.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;

@Slf4j
@NoArgsConstructor
public class JwtClaimsUtils {

  public static Long getUserId(String authorization) {
    JsonNode jsonNode = getClaim(authorization, "userId");
    return jsonNode.longValue();
  }

  private static JsonNode getClaim(String authorization, String claim) {
    if (authorization == null || !authorization.startsWith("Bearer ")) {
      log.error("Authorization não identificado ou sem prefixo Bearer.");
      throw new AccessDeniedException("Authorization não identificado ou sem prefixo Bearer.");
    }

    try {
      String token = authorization.substring(7);
      String payload = token.split("\\.")[1];
      String json = new String(Base64.getUrlDecoder().decode(payload), StandardCharsets.UTF_8);

      JsonNode claims = new ObjectMapper().readTree(json);
      JsonNode jsonNode = claims.get(claim);

      if (jsonNode == null || jsonNode.isNull()) {
        log.error("Claim não identificado no token: {}", claim);
        throw new AccessDeniedException("Claim não identificado no token.");
      }

      return jsonNode;
    }
    catch (Exception e) {
      log.error(e.getMessage(), e);
      throw new AccessDeniedException("Token inválido.");
    }
  }

}
