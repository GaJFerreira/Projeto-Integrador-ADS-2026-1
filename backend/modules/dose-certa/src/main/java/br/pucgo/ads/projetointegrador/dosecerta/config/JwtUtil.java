package br.pucgo.ads.projetointegrador.dosecerta.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

@Component
public class JwtUtil {

    @Value("${app.jwt-secret}")
    private String jwtSecret;

    // Extrai o platformUserId (claim "userId") do token JWT da requisição
    public Long extractUserId(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        String token = bearer.substring(7);
        Claims claims = Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.get("userId", Long.class);
    }

    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }
}