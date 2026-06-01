package br.com.puc.listacompras.config;

import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import javax.sql.DataSource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;

/**
 * Inicializador automatico de dados do modulo lista-compras.
 *
 * <p>Roda no boot do backend e popula o schema {@code lista_compras} com a
 * massa base necessaria para o modulo operar em qualquer maquina (categorias,
 * produtos, patologias, vinculos e templates de dieta).
 *
 * <p><b>Caracteristicas:</b>
 * <ul>
 *   <li>Ligado por default ({@code matchIfMissing = true}). Desligavel via
 *       env var {@code LISTACOMPRAS_SEED_ENABLED=false} ou property
 *       {@code listacompras.seed.enabled=false} no application.properties da
 *       plataforma — sem precisar de alteracao de codigo.</li>
 *   <li>{@code @Order(LOWEST_PRECEDENCE)} para rodar depois dos demais
 *       CommandLineRunners (em especial o da plataforma, que cria os usuarios
 *       de teste {@code admin} e {@code idoso} referenciados pelo seed).</li>
 *   <li>Idempotente: pode rodar em todo boot. O SQL usa
 *       {@code WHERE NOT EXISTS} / {@code ON CONFLICT DO NOTHING}, entao
 *       reexecucao nao gera duplicidade.</li>
 *   <li>Defensivo: qualquer falha vira warning de log; nao derruba a aplicacao.</li>
 *   <li>Isolado: escreve exclusivamente no schema {@code lista_compras} e cria
 *       a funcao auxiliar {@code public.f_unaccent} (usada por
 *       {@code ProdutoRepository.findByNomeNormalizado}).</li>
 * </ul>
 *
 * <p>Padrao de referencia: {@code CareHubDataInitializer}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
    prefix = "listacompras.seed",
    name = "enabled",
    havingValue = "true",
    matchIfMissing = true
)
@Order(Ordered.LOWEST_PRECEDENCE)
public class ListaComprasDataInitializer implements CommandLineRunner {

  private static final String SEED_CLASSPATH = "db/seed/lista-compras-seed.sql";

  private final DataSource dataSource;
  private final JdbcTemplate jdbcTemplate;

  @Override
  public void run(String... args) {
    try {
      garantirExtensaoUnaccent();
      executarSeed();
      logResumo();
    } catch (Exception e) {
      log.warn("ListaComprasDataInitializer ignorado por falha nao critica: {}", e.getMessage());
    }
  }

  /**
   * Garante a existencia da extensao {@code unaccent}, da funcao
   * {@code public.f_unaccent} e do indice de busca de produto sem acentos.
   *
   * <p>Estas operacoes sao executadas separadamente (e nao via SQL no
   * classpath) porque o corpo da funcao usa <em>dollar-quoting</em>
   * ({@code $$ ... $$}), que pode confundir o parser de scripts do Spring
   * quando misturado com instrucoes regulares.
   */
  private void garantirExtensaoUnaccent() {
    try {
      jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS unaccent");
      jdbcTemplate.execute(
          "CREATE OR REPLACE FUNCTION public.f_unaccent(text) "
              + "RETURNS text AS $$ "
              + "SELECT public.unaccent('public.unaccent', $1) "
              + "$$ LANGUAGE sql IMMUTABLE");
      jdbcTemplate.execute(
          "CREATE INDEX IF NOT EXISTS idx_produto_nome_unaccent "
              + "ON lista_compras.produto (public.f_unaccent(nome_normalizado))");
    } catch (Exception e) {
      log.warn(
          "ListaComprasDataInitializer: falha ao garantir extensao unaccent/f_unaccent: {}",
          e.getMessage());
    }
  }

  /** Executa o script {@link #SEED_CLASSPATH} via {@link ScriptUtils}. */
  private void executarSeed() throws Exception {
    Resource resource = new ClassPathResource(SEED_CLASSPATH);
    if (!resource.exists()) {
      log.warn(
          "ListaComprasDataInitializer: arquivo de seed nao encontrado no classpath ({}). Pulando.",
          SEED_CLASSPATH);
      return;
    }
    EncodedResource encoded = new EncodedResource(resource, StandardCharsets.UTF_8);
    try (Connection conn = dataSource.getConnection()) {
      ScriptUtils.executeSqlScript(conn, encoded);
    }
  }

  private void logResumo() {
    try {
      Integer produtos =
          jdbcTemplate.queryForObject("SELECT count(*) FROM lista_compras.produto", Integer.class);
      Integer categorias =
          jdbcTemplate.queryForObject(
              "SELECT count(*) FROM lista_compras.categorias", Integer.class);
      Integer patologias =
          jdbcTemplate.queryForObject(
              "SELECT count(*) FROM lista_compras.patologias", Integer.class);
      Integer templates =
          jdbcTemplate.queryForObject(
              "SELECT count(*) FROM lista_compras.lista WHERE is_template = TRUE", Integer.class);
      log.info(
          "ListaComprasDataInitializer: seed aplicado — categorias={}, produtos={}, patologias={}, templates={}.",
          categorias,
          produtos,
          patologias,
          templates);
    } catch (Exception ignored) {
      // logging best-effort; nao quebrar a inicializacao por causa do resumo
    }
  }
}
