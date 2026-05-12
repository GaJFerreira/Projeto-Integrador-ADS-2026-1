package br.pucgo.ads.projetointegrador.carehub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuração de segurança do módulo CareHub.
 *
 * <p><strong>Arquitetura nova:</strong> Este módulo NÃO registra o filtro JWT diretamente.
 * O filtro JWT é responsabilidade exclusiva da {@code plataforma} (SecurityConfig com @Order padrão).
 * Esta configuração apenas delimita o escopo dos endpoints {@code /api/carehub/**} com
 * {@code @Order(2)} para não conflitar com a config principal.
 *
 * <p>Ao rodar via launcher ({@code backend/plataforma}), o JWT já foi validado pela plataforma
 * antes de chegar aqui. Os endpoints ficam protegidos automaticamente por {@code .anyRequest().authenticated()}
 * na config principal — {@code permitAll()} aqui apenas garante compilação standalone.
 *
 * <p>Rota pública: {@code /api/carehub/health} — healthcheck sem autenticação.
 */
@Configuration
@EnableWebSecurity
public class CareHubSecurityConfig {

    @Bean
    @Order(2) // Executa DEPOIS da SecurityConfig da plataforma (que tem o filtro JWT)
    public SecurityFilterChain careHubFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/carehub/**") // Aplica APENAS para /api/carehub/**
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/carehub/health").permitAll() // Health check público
                .anyRequest().permitAll() // JWT validado pelo filtro da plataforma (Order 1)
            );

        return http.build();
    }
}
