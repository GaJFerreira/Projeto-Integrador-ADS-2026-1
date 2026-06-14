package br.pucgo.ads.projetointegrador.diario_saude.config;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class TriggerSetup {

    private final JdbcTemplate jdbcTemplate;

    public TriggerSetup(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void criarTrigger() {
        try {
            jdbcTemplate.execute("""
                        CREATE OR REPLACE FUNCTION diario_saude.excluir_usuario_clinico()
                        RETURNS TRIGGER AS $$
                        DECLARE
                            v_id_usuario BIGINT;
                        BEGIN
                            SELECT id_usuario INTO v_id_usuario
                            FROM diario_saude.usuario_info_clinica
                            WHERE platform_user_id = OLD.id;

                            IF v_id_usuario IS NOT NULL THEN
                                DELETE FROM diario_saude.ds_prescricao_medicamento
                                WHERE id_prescricao IN (
                                    SELECT id_prescricao FROM diario_saude.ds_prescricao_medica
                                    WHERE id_usuario = v_id_usuario
                                );
                                DELETE FROM diario_saude.ds_prescricao_exame
                                WHERE id_prescricao IN (
                                    SELECT id_prescricao FROM diario_saude.ds_prescricao_medica
                                    WHERE id_usuario = v_id_usuario
                                );
                                DELETE FROM diario_saude.ds_exercicio_recomendado
                                WHERE id_prescricao IN (
                                    SELECT id_prescricao FROM diario_saude.ds_prescricao_medica
                                    WHERE id_usuario = v_id_usuario
                                );
                                DELETE FROM diario_saude.ds_prescricao_medica WHERE id_usuario = v_id_usuario;
                                DELETE FROM diario_saude.ds_usuario_alergia WHERE usuario_id = v_id_usuario;
                                DELETE FROM diario_saude.ds_usuario_doenca WHERE usuario_id = v_id_usuario;
                                DELETE FROM diario_saude.ds_usuario_medicamento WHERE usuario_id = v_id_usuario;
                                DELETE FROM diario_saude.ds_cuidador_paciente WHERE paciente_id = v_id_usuario;
                                DELETE FROM diario_saude.ds_resposta_questionario WHERE platform_user_id = OLD.id;
                                DELETE FROM diario_saude.usuario_info_clinica WHERE id_usuario = v_id_usuario;
                            END IF;

                            RETURN OLD;
                        END;
                        $$ LANGUAGE plpgsql;
                    """);

            jdbcTemplate.execute("""
                        CREATE OR REPLACE TRIGGER trigger_excluir_usuario_clinico
                        AFTER DELETE ON plataforma.users
                        FOR EACH ROW
                        EXECUTE FUNCTION diario_saude.excluir_usuario_clinico();
                    """);

            System.out.println("[DiarioSaude] Trigger de exclusão criado com sucesso.");
        } catch (Exception e) {
            System.out.println("[DiarioSaude] Erro ao criar trigger: " + e.getMessage());
        }
    }
}