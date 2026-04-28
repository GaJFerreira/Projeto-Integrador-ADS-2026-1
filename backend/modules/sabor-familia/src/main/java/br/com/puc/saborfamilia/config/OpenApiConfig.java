package br.com.puc.saborfamilia.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI openAPI() {
    Info info = new Info()
      .title("Sabor da Família")
      .description("Aplicação responsável pelos serviços do módulo sabor da família")
      .version("v1");

    return new OpenAPI().info(info);
  }

}
