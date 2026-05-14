import sys
import re

file_path = r"c:\Users\enzob\Downloads\migracao\cerarub\plataforma-nova\Projeto-Integrador-ADS-2026-1\backend\modules\care-hub\src\main\java\br\pucgo\ads\projetointegrador\carehub\config\DataInitializer.java"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update method signature
content = content.replace(
    "PasswordEncoder encoder) {",
    "PasswordEncoder encoder,\n\t\t\torg.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {"
)

# 2. Add syncPlatformUser method
sync_method = """
	private Long syncPlatformUser(org.springframework.jdbc.core.JdbcTemplate jdbc, String username, String email, String name, String rawPassword, String roleCode, PasswordEncoder encoder) {
		try {
			jdbc.execute("CREATE SCHEMA IF NOT EXISTS plataforma");
			jdbc.execute("CREATE TABLE IF NOT EXISTS plataforma.roles (id BIGSERIAL PRIMARY KEY, name VARCHAR(255), code VARCHAR(255), scope VARCHAR(255))");
			jdbc.execute("CREATE TABLE IF NOT EXISTS plataforma.users (id BIGSERIAL PRIMARY KEY, username VARCHAR(255) UNIQUE, email VARCHAR(255) UNIQUE, name VARCHAR(255), password_hash VARCHAR(255), role_id BIGINT, status VARCHAR(255), created_at TIMESTAMP, updated_at TIMESTAMP, deleted_at TIMESTAMP)");
			
			java.util.List<Long> ids = jdbc.queryForList("SELECT id FROM plataforma.users WHERE username = ?", Long.class, username);
			if (!ids.isEmpty()) return ids.get(0);

			java.util.List<Long> roleIds = jdbc.queryForList("SELECT id FROM plataforma.roles WHERE name = ?", Long.class, "ROLE_" + roleCode);
			Long roleId;
			if (roleIds.isEmpty()) {
				jdbc.update("INSERT INTO plataforma.roles (name, code, scope) VALUES (?, ?, ?)", "ROLE_" + roleCode, roleCode, "LIMITED");
				roleId = jdbc.queryForObject("SELECT id FROM plataforma.roles WHERE name = ?", Long.class, "ROLE_" + roleCode);
			} else {
				roleId = roleIds.get(0);
			}

			String encPwd = encoder.encode(rawPassword);
			jdbc.update("INSERT INTO plataforma.users (username, email, name, password_hash, role_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'ACTIVE', current_timestamp, current_timestamp)",
					username, email, name, encPwd, roleId);
					
			return jdbc.queryForObject("SELECT id FROM plataforma.users WHERE username = ?", Long.class, username);
		} catch (Exception e) {
			System.err.println("Aviso: Falha ao sincronizar usuario com plataforma: " + e.getMessage());
			return null;
		}
	}
"""
content = content.replace("private void atualizarEnderecosClientesExistentes", sync_method + "\n\tprivate void atualizarEnderecosClientesExistentes")

# 3. Add setPlatformUserId to specific manual creations

# Dona Maria
content = content.replace(
    """cliente.setPassword(encoder.encode("123456"));""",
    """cliente.setPassword(encoder.encode("123456"));
			Long pIdMaria = syncPlatformUser(jdbcTemplate, "maria", "maria@example.com", "Dona Maria", "123456", "IDOSO", encoder);
			cliente.setPlatformUserId(pIdMaria);"""
)

# Joao Cuidador
content = content.replace(
    """cuidador.setPassword(encoder.encode("123456"));""",
    """cuidador.setPassword(encoder.encode("123456"));
			Long pIdJoao = syncPlatformUser(jdbcTemplate, "joao", "joao@example.com", "Joao Cuidador", "123456", "CUIDADOR", encoder);
			cuidador.setPlatformUserId(pIdJoao);"""
)

# Gildenor
content = content.replace(
    """gildenor.setPassword(encoder.encode("123456"));""",
    """gildenor.setPassword(encoder.encode("123456"));
			Long pIdGildenor = syncPlatformUser(jdbcTemplate, "gildenor", "gildenor@example.com", "Gildenor Souza", "123456", "CUIDADOR", encoder);
			gildenor.setPlatformUserId(pIdGildenor);"""
)

# Cuidadores de Teste no loop
content = content.replace(
    """ct.setPassword(encoder.encode("123456"));""",
    """ct.setPassword(encoder.encode("123456"));
				Long pIdCt = syncPlatformUser(jdbcTemplate, uname, uname + "@example.com", "Cuidador Teste " + (i + 1), "123456", "CUIDADOR", encoder);
				ct.setPlatformUserId(pIdCt);"""
)

# Idosos no loop
content = content.replace(
    """c.setPassword(encoder.encode("123456"));""",
    """c.setPassword(encoder.encode("123456"));
					Long pIdC = syncPlatformUser(jdbcTemplate, username, username + "@example.com", "Idoso Teste " + i, "123456", "IDOSO", encoder);
					c.setPlatformUserId(pIdC);"""
)

# Idoso Extra 1
content = content.replace(
    """extra1.setPassword(encoder.encode("123456"));""",
    """extra1.setPassword(encoder.encode("123456"));
				Long pIdExtra = syncPlatformUser(jdbcTemplate, "idoso_extra1", "idoso_extra1@example.com", "Idoso Extra 1", "123456", "IDOSO", encoder);
				extra1.setPlatformUserId(pIdExtra);"""
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("DataInitializer.java refatorado.")
