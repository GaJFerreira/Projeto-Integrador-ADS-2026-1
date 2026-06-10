-- =============================================================================
-- Migration 001 — Produto: campos nutricionais e custo medio de mercado
-- =============================================================================
-- Origem: feature/lista-compras-integracoes (modulo admin de cadastro de produtos)
-- Objetivo: ampliar lista_compras.produto com tabela nutricional (pacote ANVISA
--           basico) e custo medio gerenciado pelo admin.
--
-- Em ambiente de desenvolvimento, o spring.jpa.hibernate.ddl-auto=update aplica
-- estas colunas automaticamente ao subir o backend. Este script existe para
-- documentar a mudanca e ser executado manualmente em ambientes onde o
-- ddl-auto seja desligado (recomendado em producao).
-- =============================================================================

ALTER TABLE lista_compras.produto
  ADD COLUMN IF NOT EXISTS custo_medio NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS custo_medio_atualizado_em TIMESTAMP,
  ADD COLUMN IF NOT EXISTS marca VARCHAR(120),
  ADD COLUMN IF NOT EXISTS unidade_medida VARCHAR(20),
  ADD COLUMN IF NOT EXISTS porcao_referencia_gramas NUMERIC(10,3),
  ADD COLUMN IF NOT EXISTS calorias NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS proteinas NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS carboidratos NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS gorduras_totais NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS gorduras_saturadas NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS fibras NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS sodio NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS acucares NUMERIC(10,2);

-- Indice para listagem admin (paginacao/ordem por atualizacao recente do custo)
CREATE INDEX IF NOT EXISTS idx_produto_custo_atualizado_em
  ON lista_compras.produto (custo_medio_atualizado_em DESC NULLS LAST);

-- =============================================================================
-- Notas:
-- 1. O campo legado `preco` foi mantido para nao quebrar contratos publicos
--    existentes. Novos cadastros pelo admin populam `custo_medio` e
--    `custo_medio_atualizado_em`.
-- 2. Os campos nutricionais sao nullable: cadastros parciais sao permitidos
--    e o consumidor (frontend) deve renderizar "—" para valores nulos.
-- 3. Porcao em gramas — para produtos liquidos (ex: leite), use o equivalente
--    em ml (1ml ~ 1g para finalidade de rotulagem).
-- =============================================================================
