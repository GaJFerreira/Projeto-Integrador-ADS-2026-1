-- =====================================================================
-- SCRIPT DE MASSA DE DADOS – SABOR FAMÍLIA (PostgreSQL)
-- =====================================================================

-- =====================================================================
-- 1) PERFIS
-- =====================================================================

INSERT INTO perfil (
  usuario_id,
  nome,
  email,
  bio,
  data_nascimento,
  foto_perfil_url,
  data_cadastro,
  ultima_atualizacao
)
SELECT
  gs AS usuario_id,
  format('Usuário %s', gs) AS nome,
  format('user%1$s@example.com', gs) AS email,
  format('Bio do usuário %s', gs) AS bio,
  date '1980-01-01' + (gs * 30) AS data_nascimento,
  format('https://example.com/fotos/%s.jpg', gs) AS foto_perfil_url,
  now() - (gs || ' days')::interval AS data_cadastro,
  now() - (gs || ' days')::interval AS ultima_atualizacao
FROM generate_series(1, 40) AS gs;

-- =====================================================================
-- 2) RESTRIÇÕES ALIMENTARES
-- =====================================================================

-- Migração: coluna única `label` → `label_perfil` + `label_receita` (idempotente)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'restricao_alimentar' AND column_name = 'label'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'restricao_alimentar' AND column_name = 'label_perfil'
  ) THEN
    ALTER TABLE restricao_alimentar RENAME COLUMN label TO label_perfil;
    ALTER TABLE restricao_alimentar ADD COLUMN label_receita varchar(500) NOT NULL DEFAULT '';
    UPDATE restricao_alimentar SET label_receita = label_perfil WHERE label_receita = '';
    ALTER TABLE restricao_alimentar ALTER COLUMN label_receita DROP DEFAULT;
  END IF;
END $$;

-- status + ultima_atualizacao (alinhado à entidade JPA; idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'restricao_alimentar' AND column_name = 'status'
  ) THEN
    ALTER TABLE restricao_alimentar ADD COLUMN status varchar(16) NOT NULL DEFAULT 'ATIVO';
    ALTER TABLE restricao_alimentar ALTER COLUMN status DROP DEFAULT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'restricao_alimentar' AND column_name = 'ultima_atualizacao'
  ) THEN
    ALTER TABLE restricao_alimentar ADD COLUMN ultima_atualizacao timestamp NOT NULL DEFAULT now();
    UPDATE restricao_alimentar SET ultima_atualizacao = data_cadastro WHERE ultima_atualizacao IS NULL;
    ALTER TABLE restricao_alimentar ALTER COLUMN ultima_atualizacao DROP DEFAULT;
  END IF;
END $$;

-- Remove coluna descricao (não usada na API); idempotente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'restricao_alimentar' AND column_name = 'descricao'
  ) THEN
    ALTER TABLE restricao_alimentar DROP COLUMN descricao;
  END IF;
END $$;

INSERT INTO restricao_alimentar (codigo, label_perfil, label_receita, exemplos, data_cadastro, ultima_atualizacao, status)
SELECT v.codigo, v.label_perfil, v.label_receita, v.exemplos, now(), now(), 'ATIVO'::varchar
FROM (VALUES
  ('GLUTEN', 'Sem glúten', 'Contém glúten', 'trigo, cevada, centeio e derivados'),
  ('LACTOSE', 'Sem lactose', 'Contém lactose', 'lactose e derivados de leite'),
  ('ACUCAR', 'Baixo açúcar', 'Com açúcares adicionados', 'açúcares adicionados e refinados'),
  ('SODIO', 'Baixo sódio', 'Rico em sódio', 'sal e alimentos ricos em sódio'),
  ('SOJA', 'Sem soja', 'Contém soja', 'soja e derivados'),
  ('OVOS', 'Sem ovos', 'Contém ovos', 'ovos e derivados'),
  ('CASTANHAS', 'Sem castanhas', 'Pode conter castanhas', 'castanhas e derivados'),
  ('ORIGEM_ANIMAL', 'Sem origem animal', 'Contém ingredientes de origem animal', 'alimentos de origem animal'),
  ('ADOCANTE', 'Sem adoçantes artificiais', 'Com adoçantes', 'adoçantes'),
  ('CAFEINA', 'Sem cafeína', 'Contém cafeína', 'café e bebidas com cafeína')
) AS v(codigo, label_perfil, label_receita, exemplos)
WHERE NOT EXISTS (SELECT 1 FROM restricao_alimentar LIMIT 1);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'personalizacao' AND column_name = 'conceito'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'personalizacao' AND column_name = 'categoria'
  ) THEN
    ALTER TABLE personalizacao RENAME COLUMN conceito TO categoria;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_personalizacao_conceito') THEN
    ALTER INDEX idx_personalizacao_conceito RENAME TO idx_personalizacao_categoria;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'personalizacao' AND column_name = 'label'
  ) THEN
    UPDATE personalizacao SET label_perfil = label
    WHERE label_perfil IS NULL OR trim(label_perfil) = '';
    UPDATE personalizacao SET label_receita = label
    WHERE label_receita IS NULL OR trim(label_receita) = '';
    ALTER TABLE personalizacao DROP COLUMN label;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'personalizacao' AND column_name = 'descricao'
  ) THEN
    ALTER TABLE personalizacao DROP COLUMN descricao;
  END IF;
END $$;

INSERT INTO personalizacao (
  categoria,
  codigo,
  label_perfil,
  label_receita,
  status,
  data_cadastro,
  ultima_atualizacao
)
SELECT
  v.categoria,
  v.codigo,
  v.label_perfil,
  v.label_receita,
  v.status,
  now(),
  now()
FROM (VALUES
  ('TEMPO_E_ESFORCO', 'RAPIDA', 'Prefiro receitas rápidas', 'Receita rápida de fazer', 'ATIVO'),
  ('TEMPO_E_ESFORCO', 'PRATICA', 'Prefiro o preparo prático', 'Preparo prático', 'ATIVO'),
  ('TEMPO_E_ESFORCO', 'UMA_PANELA', 'Prefiro pouca louça / uma panela', 'Feita essencialmente numa panela', 'ATIVO'),
  ('TEMPO_E_ESFORCO', 'ELABORADA', 'Gosto de receitas mais elaboradas', 'Receita mais elaborada', 'ATIVO'),

  ('CUSTO_E_ACESSO', 'ECONOMICA', 'Prefiro receitas econômicas', 'Receita econômica', 'ATIVO'),
  ('CUSTO_E_ACESSO', 'INGREDIENTES_COMUNS', 'Prefiro ingredientes fáceis de achar', 'Usa ingredientes comuns', 'ATIVO'),
  ('CUSTO_E_ACESSO', 'APROVEITAMENTO', 'Gosto de aproveitar o que já tenho', 'Boa para aproveitar ingredientes', 'ATIVO'),

  ('ESTILO_E_MEMORIA', 'TRADICIONAL', 'Curto comida tradicional', 'Receita tradicional', 'ATIVO'),
  ('ESTILO_E_MEMORIA', 'CONFORTO', 'Busco comida de conforto', 'Receita de conforto', 'ATIVO'),
  ('ESTILO_E_MEMORIA', 'CASEIRA', 'Prefiro comida caseira', 'Comida caseira', 'ATIVO'),

  ('CONTEXTO_DE_CONSUMO', 'PARA_FAMILIA', 'Costumo cozinhar para a família', 'Boa para a família', 'ATIVO'),
  ('CONTEXTO_DE_CONSUMO', 'PARA_2_PESSOAS', 'Costumo cozinhar para duas pessoas', 'Pensada para duas pessoas', 'ATIVO'),
  ('CONTEXTO_DE_CONSUMO', 'DIA_A_DIA', 'Priorizo o dia a dia', 'Encaixa no dia a dia', 'ATIVO'),
  ('CONTEXTO_DE_CONSUMO', 'FIM_DE_SEMANA', 'Gosto de receitas para o fim de semana', 'Ideal para o fim de semana', 'ATIVO'),

  ('UTENSILIOS_E_EQUIPAMENTOS', 'USO_FORNO', 'Uso muito o forno', 'Central no forno', 'ATIVO'),
  ('UTENSILIOS_E_EQUIPAMENTOS', 'USO_AIR_FRYER', 'Conto com a air fryer', 'Feita na air fryer', 'ATIVO'),
  ('UTENSILIOS_E_EQUIPAMENTOS', 'PANELA_PRESSAO', 'Uso panela de pressão', 'Com panela de pressão', 'ATIVO'),
  ('UTENSILIOS_E_EQUIPAMENTOS', 'SO_FOGAO', 'Quase só fogão e panela', 'Feita no fogão', 'ATIVO'),
  ('UTENSILIOS_E_EQUIPAMENTOS', 'MICRO_ONDAS', 'Uso micro-ondas com frequência', 'Micro-ondas no preparo', 'ATIVO'),
  ('UTENSILIOS_E_EQUIPAMENTOS', 'GRELHA_OU_CHAPA', 'Gosto de grelhar / chapa', 'Na grelha ou chapa', 'ATIVO'),
  ('UTENSILIOS_E_EQUIPAMENTOS', 'LIQUIDIFICADOR_PROCESSADOR', 'Uso liquidificador ou processador', 'Precisa de liquidificador / processador', 'ATIVO')
) AS v(categoria, codigo, label_perfil, label_receita, status)
ON CONFLICT (codigo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  label_perfil = EXCLUDED.label_perfil,
  label_receita = EXCLUDED.label_receita,
  status = EXCLUDED.status,
  ultima_atualizacao = now();

ALTER TABLE personalizacao ALTER COLUMN label_perfil SET NOT NULL;
ALTER TABLE personalizacao ALTER COLUMN label_receita SET NOT NULL;

-- =====================================================================
-- 3) PERFIL x RESTRIÇÃO ALIMENTAR (vínculos)
-- =====================================================================

WITH restricoes AS (
  SELECT id AS restricao_id, row_number() OVER (ORDER BY id) AS rn
  FROM restricao_alimentar
),
perfis AS (
  SELECT id AS perfil_id, row_number() OVER (ORDER BY id) AS rn
  FROM perfil
),
vinculos AS (
  SELECT
    p.perfil_id,
    r.restricao_id,
    row_number() OVER (ORDER BY p.perfil_id, r.restricao_id) AS rn
  FROM perfis p
  CROSS JOIN restricoes r
  WHERE (p.perfil_id + r.rn) % 3 IN (0, 1)
)
INSERT INTO perfil_restricao_alimentar (perfil_id, restricao_alimentar_id, data_cadastro)
SELECT
  perfil_id,
  restricao_id,
  now() - (rn || ' days')::interval
FROM vinculos
ON CONFLICT (perfil_id, restricao_alimentar_id) DO NOTHING;

-- =====================================================================
-- 4) RECEITAS (20 receitas distribuídas entre os 40 perfis de forma aleatória)
-- =====================================================================

WITH perfis AS (
  SELECT id AS perfil_id, row_number() OVER (ORDER BY id) AS rn
  FROM perfil
),
nums AS (SELECT gs AS seq FROM generate_series(1, 20) AS gs),
receitas_base AS (
  SELECT n.seq, p.perfil_id
  FROM nums n
  JOIN perfis p ON p.rn = ((n.seq * 17 + 11) % 40) + 1
)
INSERT INTO receita (
  titulo,
  tipo_refeicao,
  ingredientes,
  modo_preparo,
  historia,
  tempo_preparo_min,
  qtd_porcoes,
  data_cadastro,
  ultima_atualizacao,
  perfil_id,
  count_curtidas,
  count_comentarios
)
SELECT
  format('Receita %s do perfil %s', r.seq, r.perfil_id) AS titulo,
  (ARRAY['CAFE_DA_MANHA','ALMOCO','LANCHE','JANTAR','SOBREMESA'])[
    ((r.seq - 1) % 5) + 1
  ]::text AS tipo_refeicao,
  format('Ingredientes da receita %s', r.seq) AS ingredientes,
  format('Modo de preparo da receita %s', r.seq) AS modo_preparo,
  format('História da receita %s', r.seq) AS historia,
  10 + (r.seq % 50) AS tempo_preparo_min,
  2 + (r.seq % 6) AS qtd_porcoes,
  now() - (r.seq || ' hours')::interval AS data_cadastro,
  now() - (r.seq || ' hours')::interval AS ultima_atualizacao,
  r.perfil_id,
  0,
  0
FROM receitas_base r;

-- =====================================================================
-- 4.1) VÍNCULOS DE PERSONALIZAÇÃO (modelo genérico)
-- =====================================================================

INSERT INTO personalizacao_perfil (perfil_id, personalizacao_id, data_cadastro)
SELECT p.id, o.id, p.data_cadastro
FROM perfil p
JOIN personalizacao o
  ON o.codigo = CASE (p.id % 4)
    WHEN 0 THEN 'RAPIDA'
    WHEN 1 THEN 'ECONOMICA'
    WHEN 2 THEN 'PARA_FAMILIA'
    ELSE 'USO_AIR_FRYER'
  END
ON CONFLICT (perfil_id, personalizacao_id) DO NOTHING;

INSERT INTO personalizacao_receita (receita_id, personalizacao_id, data_cadastro)
SELECT r.id, o.id, r.data_cadastro
FROM receita r
JOIN personalizacao o
  ON o.codigo = CASE (r.id % 4)
    WHEN 0 THEN 'RAPIDA'
    WHEN 1 THEN 'ECONOMICA'
    WHEN 2 THEN 'PARA_FAMILIA'
    ELSE 'USO_AIR_FRYER'
  END
ON CONFLICT (receita_id, personalizacao_id) DO NOTHING;

-- =====================================================================
-- 5) RELACIONAMENTOS DE SEGUINDO (40 perfis; até 200 pares)
-- =====================================================================

WITH perfis AS (
  SELECT id AS perfil_id
  FROM perfil
  ORDER BY id
),
pairs AS (
  SELECT
    p1.perfil_id AS seguidor_id,
    p2.perfil_id AS seguido_id,
    row_number() OVER (ORDER BY p1.perfil_id, p2.perfil_id) AS rn
  FROM perfis p1
  JOIN perfis p2 ON p1.perfil_id <> p2.perfil_id
)
INSERT INTO seguindo (
  seguidor_id,
  seguido_id,
  data_cadastro
)
SELECT
  seguidor_id,
  seguido_id,
  now() - (rn || ' minutes')::interval
FROM pairs
WHERE rn <= 200
ON CONFLICT (seguidor_id, seguido_id) DO NOTHING;

-- =====================================================================
-- 6) FEED PERFIL-RECEITA (autor vê sua receita; seguidor vê receitas de quem segue)
-- =====================================================================

INSERT INTO feed_perfil_receita (perfil_id, receita_id, data_cadastro)
SELECT perfil_id, receita_id, data_cadastro
FROM (
  -- Autor vê cada uma de suas receitas
  SELECT r.perfil_id, r.id AS receita_id, r.data_cadastro
  FROM receita r
  UNION ALL
  -- Seguidor vê cada receita de quem segue
  SELECT s.seguidor_id AS perfil_id, r.id AS receita_id, r.data_cadastro
  FROM receita r
  JOIN seguindo s ON s.seguido_id = r.perfil_id
) AS feed_rows
ON CONFLICT (perfil_id, receita_id) DO NOTHING;

INSERT INTO receita_restricao_alimentar (receita_id, restricao_alimentar_id, data_cadastro)
SELECT r.id, ra.id, r.data_cadastro
FROM (
  SELECT id, data_cadastro, row_number() OVER (ORDER BY id) AS rn
  FROM receita
  LIMIT 20
) r
JOIN (
  SELECT id, row_number() OVER (ORDER BY id) AS rn
  FROM restricao_alimentar
  LIMIT 3
) ra ON ((r.rn - 1) % 3) + 1 = ra.rn
ON CONFLICT (receita_id, restricao_alimentar_id) DO NOTHING;

-- =====================================================================
-- 7) CURTIDAS DE RECEITAS (20 receitas, 40 perfis)
-- =====================================================================

WITH receitas AS (
  SELECT id AS receita_id
  FROM receita
  ORDER BY id
),
perfis AS (
  SELECT id AS perfil_id
  FROM perfil
  ORDER BY id
),
base AS (
  SELECT
    r.receita_id,
    p.perfil_id,
    row_number() OVER () AS rn
  FROM receitas r
  JOIN perfis p ON (p.perfil_id % 5) = (r.receita_id % 5)
)
INSERT INTO curtida_receita (
  receita_id,
  perfil_id,
  data_cadastro
)
SELECT
  receita_id,
  perfil_id,
  now() - (rn || ' seconds')::interval
FROM base
WHERE rn <= 150
ON CONFLICT (receita_id, perfil_id) DO NOTHING;

-- =====================================================================
-- 8) FAVORITOS DE RECEITAS
-- =====================================================================

WITH perfis AS (
  SELECT id AS perfil_id
  FROM perfil
  ORDER BY id
),
receitas AS (
  SELECT id AS receita_id
  FROM receita
  ORDER BY id
),
base AS (
  SELECT
    r.receita_id,
    p.perfil_id,
    row_number() OVER () AS rn
  FROM receitas r
  JOIN perfis p ON (p.perfil_id % 7) = (r.receita_id % 7)
)
INSERT INTO favorito_receita (
  receita_id,
  perfil_id,
  data_cadastro
)
SELECT
  receita_id,
  perfil_id,
  now() - (rn || ' minutes')::interval
FROM base
WHERE rn <= 80
ON CONFLICT (receita_id, perfil_id) DO NOTHING;

-- =====================================================================
-- 9) COMENTÁRIOS EM RECEITAS
-- =====================================================================

WITH receitas AS (
  SELECT id AS receita_id
  FROM receita
  ORDER BY id
),
perfis AS (
  SELECT id AS perfil_id
  FROM perfil
  ORDER BY id
),
base AS (
  SELECT
    r.receita_id,
    p.perfil_id,
    row_number() OVER () AS rn
  FROM receitas r
  JOIN perfis p ON (p.perfil_id % 10) = (r.receita_id % 10)
)
INSERT INTO comentario_receita (
  receita_id,
  perfil_id,
  texto,
  data_cadastro
)
SELECT
  receita_id,
  perfil_id,
  format('Comentário %s na receita %s pelo perfil %s', rn, receita_id, perfil_id),
  now() - (rn || ' seconds')::interval
FROM base
WHERE rn <= 120;

-- =====================================================================
-- 10) CONVERSAS ENTRE PERFIS
-- =====================================================================

WITH perfis AS (
  SELECT id AS perfil_id
  FROM perfil
  ORDER BY id
),
pairs AS (
  SELECT
    p1.perfil_id AS primeiro_participante,
    p2.perfil_id AS segundo_participante,
    row_number() OVER (ORDER BY p1.perfil_id, p2.perfil_id) AS rn
  FROM perfis p1
  JOIN perfis p2 ON p1.perfil_id < p2.perfil_id
)
INSERT INTO conversa (
  primeiro_participante,
  segundo_participante,
  data_envio_ultima_mensagem,
  conteudo_ultima_mensagem
)
SELECT
  primeiro_participante,
  segundo_participante,
  now() - (rn || ' minutes')::interval,
  format('Última mensagem da conversa %s entre %s e %s', rn, primeiro_participante, segundo_participante)
FROM pairs
WHERE rn <= 60
ON CONFLICT (primeiro_participante, segundo_participante) DO NOTHING;

-- =====================================================================
-- 11) MENSAGENS EM CADA CONVERSA
-- =====================================================================

WITH conversas AS (
  SELECT
    c.id AS conversa_id,
    c.primeiro_participante,
    c.segundo_participante
  FROM conversa c
),
msgs AS (
  SELECT
    c.conversa_id,
    CASE WHEN (gs % 2) = 0 THEN c.primeiro_participante ELSE c.segundo_participante END AS remetente_id,
    CASE WHEN (gs % 2) = 0 THEN c.segundo_participante ELSE c.primeiro_participante END AS destinatario_id,
    row_number() OVER (ORDER BY c.conversa_id, gs) AS rn_global,
    gs AS seq_msg
  FROM conversas c
  JOIN generate_series(1, 20) AS gs ON true
),
total_msgs AS (
  SELECT count(*) AS total FROM msgs
)
INSERT INTO mensagem (
  remetente_id,
  destinatario_id,
  conversa_id,
  texto,
  data_envio
)
SELECT
  m.remetente_id,
  m.destinatario_id,
  m.conversa_id,
  format('Mensagem %s da conversa %s', m.seq_msg, m.conversa_id),
  now() - (t.total + 1 - m.rn_global) * interval '1 second'
FROM msgs m
CROSS JOIN total_msgs t
ORDER BY m.conversa_id, m.seq_msg;