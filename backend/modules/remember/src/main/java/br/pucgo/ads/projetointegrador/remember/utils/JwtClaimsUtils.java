package br.pucgo.ads.projetointegrador.remember.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;

@Slf4j
public class JwtClaimsUtils {

    private JwtClaimsUtils() {
    }

    public record UsuarioTokenClaims(Long userId, String nome, String email) {
    }

    public static Long getUserId(String authorization) {
        return getClaim(authorization, "userId").longValue();
    }

    public static UsuarioTokenClaims getUsuario(String authorization) {
        JsonNode claims = getClaims(authorization);
        Long userId = getRequiredClaim(claims, "userId").longValue();
        String email = getTextClaim(claims, "email");

        if (email == null) {
            email = getTextClaim(claims, "sub");
        }

        if (email == null) {
            log.error("Claim de email nao identificada no token.");
            throw new AccessDeniedException("Claim de email nao identificada no token.");
        }

        String nome = getTextClaim(claims, "name");

        if (nome == null) {
            log.error("Claim de nome nao identificada no token.");
            throw new AccessDeniedException("Claim de nome nao identificada no token.");
        }

        return new UsuarioTokenClaims(userId, nome, email);
    }

    private static JsonNode getClaim(String authorization, String claim) {
        return getRequiredClaim(getClaims(authorization), claim);
    }

    private static JsonNode getClaims(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            log.error("Authorization nao identificado ou sem prefixo Bearer.");
            throw new AccessDeniedException("Authorization nao identificado ou sem prefixo Bearer.");
        }

        try {
            String token = authorization.substring(7);
            String payload = token.split("\\.")[1];
            String json = new String(Base64.getUrlDecoder().decode(payload), StandardCharsets.UTF_8);

            return new ObjectMapper().readTree(json);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new AccessDeniedException("Token invalido.");
        }
    }

    private static JsonNode getRequiredClaim(JsonNode claims, String claim) {
        JsonNode jsonNode = claims.get(claim);

        if (jsonNode == null || jsonNode.isNull()) {
            log.error("Claim nao identificado no token: {}", claim);
            throw new AccessDeniedException("Claim nao identificado no token.");
        }

        return jsonNode;
    }

    private static String getTextClaim(JsonNode claims, String claim) {
        JsonNode jsonNode = claims.get(claim);

        if (jsonNode == null || jsonNode.isNull() || jsonNode.asText().isBlank()) {
            return null;
        }

        return jsonNode.asText();
    }
}
