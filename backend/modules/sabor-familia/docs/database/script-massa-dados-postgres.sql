-- =====================================================================
-- SCRIPT DE DADOS ESSENCIAIS – SABOR FAMÍLIA (PostgreSQL)
-- =====================================================================
-- Propósito: catálogos e ajustes de schema usados pela API.
-- Não insere perfis, receitas, feed, curtidas, comentários, conversas etc.
-- Usuários da plataforma vêm do DataInitializer; perfis e conteúdo são
-- criados pelo fluxo da aplicação (cadastro + uso).
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS sabor_familia;
SET search_path TO sabor_familia, public;

-- =====================================================================
-- 1) AJUSTES DE SCHEMA (idempotentes)
-- =====================================================================

-- perfil: remover coluna legada de URL externa (mídia em sabor_familia.midia)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sabor_familia' AND table_name = 'perfil' AND column_name = 'foto_perfil_url'
  ) THEN
    ALTER TABLE perfil DROP COLUMN foto_perfil_url;
  END IF;
END $$;

-- restricao_alimentar: label → label_perfil + label_receita
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sabor_familia' AND table_name = 'restricao_alimentar' AND column_name = 'label'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sabor_familia' AND table_name = 'restricao_alimentar' AND column_name = 'label_perfil'
  ) THEN
    ALTER TABLE restricao_alimentar RENAME COLUMN label TO label_perfil;
    ALTER TABLE restricao_alimentar ADD COLUMN label_receita varchar(500) NOT NULL DEFAULT '';
    UPDATE restricao_alimentar SET label_receita = label_perfil WHERE label_receita = '';
    ALTER TABLE restricao_alimentar ALTER COLUMN label_receita DROP DEFAULT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sabor_familia' AND table_name = 'restricao_alimentar' AND column_name = 'status'
  ) THEN
    ALTER TABLE restricao_alimentar ADD COLUMN status varchar(16) NOT NULL DEFAULT 'ATIVO';
    ALTER TABLE restricao_alimentar ALTER COLUMN status DROP DEFAULT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sabor_familia' AND table_name = 'restricao_alimentar' AND column_name = 'ultima_atualizacao'
  ) THEN
    ALTER TABLE restricao_alimentar ADD COLUMN ultima_atualizacao timestamp NOT NULL DEFAULT now();
    UPDATE restricao_alimentar SET ultima_atualizacao = data_cadastro WHERE ultima_atualizacao IS NULL;
    ALTER TABLE restricao_alimentar ALTER COLUMN ultima_atualizacao DROP DEFAULT;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sabor_familia' AND table_name = 'restricao_alimentar' AND column_name = 'descricao'
  ) THEN
    ALTER TABLE restricao_alimentar DROP COLUMN descricao;
  END IF;
END $$;

-- personalizacao: conceito → categoria; remover label/descricao legados
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sabor_familia' AND table_name = 'personalizacao' AND column_name = 'conceito'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sabor_familia' AND table_name = 'personalizacao' AND column_name = 'categoria'
  ) THEN
    ALTER TABLE personalizacao RENAME COLUMN conceito TO categoria;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'sabor_familia'
      AND indexname = 'idx_personalizacao_conceito'
  ) THEN
    ALTER INDEX sabor_familia.idx_personalizacao_conceito RENAME TO idx_personalizacao_categoria;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sabor_familia' AND table_name = 'personalizacao' AND column_name = 'label'
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
    WHERE table_schema = 'sabor_familia' AND table_name = 'personalizacao' AND column_name = 'descricao'
  ) THEN
    ALTER TABLE personalizacao DROP COLUMN descricao;
  END IF;
END $$;

-- =====================================================================
-- 2) CATÁLOGO – RESTRIÇÕES ALIMENTARES
-- =====================================================================

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

-- =====================================================================
-- 3) CATÁLOGO – PERSONALIZAÇÕES
-- =====================================================================

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
