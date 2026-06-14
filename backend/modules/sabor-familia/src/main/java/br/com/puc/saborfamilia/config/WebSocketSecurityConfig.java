package br.com.puc.saborfamilia.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class WebSocketSecurityConfig {

  @Bean
  @Order(0)
  public SecurityFilterChain webSocketSecurityFilterChain(HttpSecurity http) throws Exception {
    http
      .securityMatcher(WebSocketConfig.ENDPOINT_WEBSOCKET, WebSocketConfig.ENDPOINT_WEBSOCKET + "/**")
      .csrf(AbstractHttpConfigurer::disable)
      .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

    return http.build();
  }
}
