package br.pucgo.ads.projetointegrador.carehub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuração de CORS para o módulo CareHub.
 *
 * <p>Registra as origens permitidas para desenvolvimento local (Vite / React).
 * Em produção, as origens devem ser configuradas via variável de ambiente
 * ou no {@code application.properties} do launcher.
 *
 * <p>Nota: o bean {@code carehubCorsConfigurationSource} foi renomeado para evitar
 * conflito com o bean {@code corsConfigurationSource} da plataforma principal.
 */
@Configuration
public class CareHubCorsConfig {

    private static final List<String> LOCALHOST_ORIGINS = List.of(
            "http://localhost:5173",
            "http://localhost:5174", // Porta alternativa do Vite
            "http://localhost:4173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://127.0.0.1:4173",
            "http://127.0.0.1:3000"
    );

    @Bean("carehubCorsConfigurationSource")
    public CorsConfigurationSource carehubCorsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(LOCALHOST_ORIGINS);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "X-User-Id", "Accept"));
        config.setExposedHeaders(List.of("Content-Disposition"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
