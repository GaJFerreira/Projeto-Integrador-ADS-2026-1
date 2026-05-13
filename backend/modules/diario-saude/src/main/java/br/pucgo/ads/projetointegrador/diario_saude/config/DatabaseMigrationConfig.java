package br.pucgo.ads.projetointegrador.diario_saude.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseMigrationConfig.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigrationConfig(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void executarMigracoes() {
        corrigirFkRespostaQuestionario();
        adicionarFkUsuarioInfoClinica();
        corrigirFkPrescricaoMedico();
        importarMedicamentosSeVazio();
    }

    // ── Correção original do projeto ─────────────────────────────────────────
    private void corrigirFkRespostaQuestionario() {
        try {
            Integer count = jdbcTemplate.queryForObject("""
                    SELECT COUNT(*) FROM information_schema.table_constraints
                    WHERE table_name = 'ds_resposta_questionario'
                      AND constraint_name = 'fk6nxg9ej7jtwk0w5m3c89j4ipu'
                    """, Integer.class);

            if (count != null && count > 0) {
                log.info("[Questionário] FK antiga encontrada — corrigindo para apontar para 'users'...");

                jdbcTemplate.execute("""
                        ALTER TABLE ds_resposta_questionario
                            DROP CONSTRAINT fk6nxg9ej7jtwk0w5m3c89j4ipu
                        """);

                jdbcTemplate.execute("""
                        ALTER TABLE ds_resposta_questionario
                            ADD CONSTRAINT fk_resposta_questionario_user
                            FOREIGN KEY (usuario_id) REFERENCES users(id)
                        """);

                log.info("[Questionário] FK corrigida com sucesso.");
            } else {
                log.debug("[Questionário] FK já está correta, nenhuma ação necessária.");
            }

        } catch (Exception e) {
            log.warn("[Questionário] Não foi possível verificar/corrigir FK: {}", e.getMessage());
        }
    }

    private void adicionarFkUsuarioInfoClinica() {
        try {
            Integer count = jdbcTemplate.queryForObject("""
                    SELECT COUNT(*) FROM information_schema.table_constraints
                    WHERE table_name = 'usuario_info_clinica'
                      AND constraint_name = 'fk_usuario_info_clinica_user'
                    """, Integer.class);

            if (count != null && count == 0) {
                log.info("[UsuarioInfo] Adicionando coluna user_id e FK para users...");

                jdbcTemplate.execute("""
                        ALTER TABLE usuario_info_clinica
                        ADD COLUMN IF NOT EXISTS user_id BIGINT
                        """);

                jdbcTemplate.execute("""
                        ALTER TABLE usuario_info_clinica
                        ADD CONSTRAINT fk_usuario_info_clinica_user
                        FOREIGN KEY (user_id) REFERENCES users(id)
                        """);

                log.info("[UsuarioInfo] FK adicionada com sucesso.");
            } else {
                log.debug("[UsuarioInfo] FK já existe, nenhuma ação necessária.");
            }

        } catch (Exception e) {
            log.warn("[UsuarioInfo] Não foi possível adicionar FK: {}", e.getMessage());
        }
    }

    // ── Migração: FK de ds_prescricao_medica/id_medico → users ───────────────
    private void corrigirFkPrescricaoMedico() {
        try {
            Integer count = jdbcTemplate.queryForObject("""
                    SELECT COUNT(*) FROM information_schema.table_constraints
                    WHERE table_name = 'ds_prescricao_medica'
                      AND constraint_name = 'fknyucclqtfqxlm94phastn5ava'
                    """, Integer.class);

            if (count != null && count > 0) {
                log.info("[Prescrição] FK antiga de id_medico encontrada — corrigindo para apontar para 'users'...");

                jdbcTemplate.execute("""
                        ALTER TABLE ds_prescricao_medica
                            DROP CONSTRAINT fknyucclqtfqxlm94phastn5ava
                        """);

                jdbcTemplate.execute("""
                        ALTER TABLE ds_prescricao_medica
                            ADD CONSTRAINT fk_prescricao_medico_user
                            FOREIGN KEY (id_medico) REFERENCES users(id)
                        """);

                log.info("[Prescrição] FK de id_medico corrigida para apontar para 'users'.");
            } else {
                log.debug("[Prescrição] FK de id_medico já está correta, nenhuma ação necessária.");
            }

        } catch (Exception e) {
            log.warn("[Prescrição] Não foi possível corrigir FK de id_medico: {}", e.getMessage());
        }
    }

    private void importarMedicamentosSeVazio() {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM ds_medicamento", Integer.class);

            if (count != null && count > 0) {
                log.debug("[Medicamentos] Tabela já populada ({} registros), pulando importação.", count);
                return;
            }

            log.info("[Medicamentos] Tabela vazia — iniciando importação do CSV...");

            org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource(
                    "data/dados_abertos_medicamentos.csv");

            try (java.io.BufferedReader br = new java.io.BufferedReader(
                    new java.io.InputStreamReader(resource.getInputStream(), "ISO-8859-1"))) {

                br.readLine(); // pula cabeçalho

                String linha;
                java.util.List<Object[]> lote = new java.util.ArrayList<>();

                while ((linha = br.readLine()) != null) {
                    String[] col = linha.split(";");
                    if (col.length < 11)
                        continue;

                    String nome = col[1].replace("\"", "").trim();
                    String principioAtivo = col[10].replace("\"", "").trim();
                    String empresa = col[8].replace("\"", "").trim();
                    String classe = col[7].replace("\"", "").trim();
                    String numeroRegistro = col[4].replace("\"", "").trim();

                    if (nome.isEmpty())
                        continue;

                    lote.add(new Object[] { nome, principioAtivo, empresa, classe, numeroRegistro });

                    if (lote.size() >= 500) {
                        salvarLote(lote);
                        lote.clear();
                    }
                }

                if (!lote.isEmpty()) {
                    salvarLote(lote);
                }

                log.info("[Medicamentos] Importação concluída!");
            }

        } catch (Exception e) {
            log.warn("[Medicamentos] Erro ao importar CSV: {}", e.getMessage());
        }
    }

    private void salvarLote(java.util.List<Object[]> lote) {
        jdbcTemplate.batchUpdate(
                "INSERT INTO ds_medicamento (nome, principio_ativo, empresa, classe_terapeutica, numero_registro) " +
                        "VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING",
                lote);
    }

}