-- Trigger: exclui registro clínico do diário saúde quando usuário é deletado da plataforma
-- Rodar APÓS as tabelas serem criadas pelo Hibernate

CREATE OR REPLACE FUNCTION diario_saude.excluir_usuario_clinico()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM diario_saude.usuario_info_clinica 
    WHERE platform_user_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_excluir_usuario_clinico
AFTER DELETE ON plataforma.users
FOR EACH ROW
EXECUTE FUNCTION diario_saude.excluir_usuario_clinico();