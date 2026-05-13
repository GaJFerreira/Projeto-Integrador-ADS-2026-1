package br.com.puc.listacompras.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuracao OpenAPI do modulo lista-compras.
 * Renomeada de OpenApiConfig para evitar conflito de nome de bean com o
 * br.com.puc.saborfamilia.config.OpenApiConfig (Spring usa o nome simples
 * da classe como nome do bean por padrao).
 */
@Configuration
public class ListaComprasOpenApiConfig {

  @Bean
  public OpenAPI listaComprasOpenAPI() {
    Info info = new Info()
      .title("Compre com Saude")
      .description("Aplicacao responsavel pelos servicos do modulo lista de compras (Compre com Saude)")
      .version("v1");

    return new OpenAPI().info(info);
  }

}
