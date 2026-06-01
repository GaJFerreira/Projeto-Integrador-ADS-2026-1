-- 1. Cria o cercadinho do seu módulo
CREATE SCHEMA IF NOT EXISTS remember;

-- 2. Cria o usuário LOCAL do seu módulo (Obrigatório pelo guia da Plataforma)
CREATE TABLE remember.usuario (
  id_usuario BIGSERIAL PRIMARY KEY,
  platform_user_id BIGINT NOT NULL UNIQUE, -- Guarda o ID original do idoso lá da plataforma central
  nome VARCHAR(255),
  email VARCHAR(255)
);

-- 3. Cria as suas tabelas normais (agora protegidas dentro de "remember.")
CREATE TABLE remember.pergunta_template (
  id_pergunta_template BIGSERIAL PRIMARY KEY,
  texto_template TEXT NOT NULL,
  gatilho_tipo INTEGER NOT NULL,
  gatilho_valores TEXT,
  campo_alvo VARCHAR(50),
  campo_placeholder VARCHAR(50),
  ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE remember.conquista (
  id_conquista BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  meta INTEGER NOT NULL,
  pontos INTEGER NOT NULL,
  tipo INTEGER NOT NULL
);

CREATE TABLE remember.lembranca (
  id_lembranca BIGSERIAL PRIMARY KEY,
  id_usuario BIGINT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  data_acontecimento DATE NOT NULL,
  pessoas_presentes TEXT,
  local VARCHAR(255),
  historia TEXT NOT NULL,
  data_criacao TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  data_atualizacao TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT fk_lembranca_usuario FOREIGN KEY (id_usuario) REFERENCES remember.usuario (id_usuario) ON DELETE CASCADE
);

CREATE TABLE remember.diario (
  id_diario BIGSERIAL PRIMARY KEY,
  id_usuario BIGINT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  data_escrita DATE NOT NULL,
  data_criacao TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  data_atualizacao TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT fk_diario_usuario FOREIGN KEY (id_usuario) REFERENCES remember.usuario (id_usuario) ON DELETE CASCADE
);

CREATE TABLE remember.midia (
  id_midia BIGSERIAL PRIMARY KEY,
  id_lembranca BIGINT,
  id_diario BIGINT,
  url_arquivo VARCHAR(512) NOT NULL,
  data_upload TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT fk_midia_lembranca FOREIGN KEY (id_lembranca) REFERENCES remember.lembranca (id_lembranca) ON DELETE CASCADE,
  CONSTRAINT fk_midia_diario FOREIGN KEY (id_diario) REFERENCES remember.diario (id_diario) ON DELETE CASCADE
);

CREATE TABLE remember.pergunta_cognitiva (
  id_pergunta BIGSERIAL PRIMARY KEY,
  id_template_origem BIGINT NOT NULL,
  id_usuario BIGINT NOT NULL,
  id_lembranca_relacionada BIGINT,
  id_diario_relacionado BIGINT,
  texto_pergunta TEXT NOT NULL,
  status INTEGER NOT NULL,
  data_geracao TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT fk_pergunta_template FOREIGN KEY (id_template_origem) REFERENCES remember.pergunta_template (id_pergunta_template) ON DELETE RESTRICT,
  CONSTRAINT fk_pergunta_usuario FOREIGN KEY (id_usuario) REFERENCES remember.usuario (id_usuario) ON DELETE RESTRICT,
  CONSTRAINT fk_pergunta_lembranca FOREIGN KEY (id_lembranca_relacionada) REFERENCES remember.lembranca (id_lembranca) ON DELETE SET NULL,
  CONSTRAINT fk_pergunta_diario FOREIGN KEY (id_diario_relacionado) REFERENCES remember.diario (id_diario) ON DELETE SET NULL
);

CREATE TABLE remember.resposta_pergunta_usuario (
  id_resposta_pergunta_usuario BIGSERIAL PRIMARY KEY,
  id_pergunta BIGINT NOT NULL UNIQUE,
  id_usuario BIGINT NOT NULL,
  texto_resposta TEXT NOT NULL,
  data_resposta TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT fk_resposta_pergunta FOREIGN KEY (id_pergunta) REFERENCES remember.pergunta_cognitiva (id_pergunta) ON DELETE CASCADE,
  CONSTRAINT fk_resposta_usuario FOREIGN KEY (id_usuario) REFERENCES remember.usuario (id_usuario) ON DELETE RESTRICT
);

CREATE TABLE remember.usuario_conquista (
  id_usuario BIGINT NOT NULL,
  id_conquista BIGINT NOT NULL,
  data_obtencao TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  PRIMARY KEY (id_usuario, id_conquista),
  CONSTRAINT fk_usuario_conquista_usuario FOREIGN KEY (id_usuario) REFERENCES remember.usuario (id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_usuario_conquista_conquista FOREIGN KEY (id_conquista) REFERENCES remember.conquista (id_conquista) ON DELETE CASCADE
);