-- ============================================================================
-- Compre com Saude (lista_compras) - Script consolidado de massa de dados
-- ============================================================================
-- IMPORTANTE: a partir de agora, este script NAO precisa ser executado
-- manualmente. O ListaComprasDataInitializer carrega automaticamente a massa
-- (versao adaptada em src/main/resources/db/seed/lista-compras-seed.sql) toda
-- vez que o backend sobe, de forma idempotente e resiliente a IDs variaveis.
--
-- Este arquivo permanece em docs/ como REFERENCIA HISTORICA E DOCUMENTAL da
-- massa do modulo. Edicoes funcionais devem ser feitas no .sql do classpath.
--
-- Caso queira rodar manualmente (debug / ambiente sem DataInitializer):
--   1) Suba o backend ao menos uma vez para o Hibernate criar as tabelas.
--   2) Execute este script no banco "projeto_integrador".
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0) EXTENSAO unaccent + funcao IMMUTABLE f_unaccent
--    Usada apenas por este seed para gravar nome_normalizado sem acentos
--    (a busca por nome roda em JPA puro sobre a coluna ja normalizada).
-- ----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.f_unaccent(text)
  RETURNS text AS $$
SELECT public.unaccent('public.unaccent', $1)
$$ LANGUAGE sql IMMUTABLE;

CREATE INDEX IF NOT EXISTS idx_produto_nome_unaccent
  ON lista_compras.produto (public.f_unaccent(nome_normalizado));

-- ----------------------------------------------------------------------------
-- 1) CATEGORIAS
-- ----------------------------------------------------------------------------

INSERT INTO lista_compras.categorias (nome, descricao, created_at, updated_at)
VALUES
  ('Laticinios',        'Derivados do leite e similares',         NOW(), NOW()),
  ('Padaria',           'Paes e produtos de panificacao',         NOW(), NOW()),
  ('Mercearia',         'Itens basicos de despensa',              NOW(), NOW()),
  ('Hortifruti',        'Frutas, legumes e verduras',             NOW(), NOW()),
  ('Bebidas',           'Sucos, chas e refrigerantes',            NOW(), NOW()),
  ('Limpeza',           'Produtos de limpeza domestica',          NOW(), NOW()),
  ('Higiene',           'Higiene pessoal e banho',                NOW(), NOW()),
  ('Enlatados',         'Alimentos enlatados',                    NOW(), NOW()),
  ('Condimentos',       'Molhos, temperos e especiarias',         NOW(), NOW()),
  ('Massas e Cereais',  'Massas, graos e cereais',                NOW(), NOW()),
  ('Frios e Embutidos', 'Queijos, presuntos e embutidos',         NOW(), NOW()),
  ('Carnes e Peixes',   'Proteinas animais',                      NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2) PRODUTOS (catalogo completo - basicos + substitutos)
-- ----------------------------------------------------------------------------

WITH p(nome, preco, cat, tags) AS (
  VALUES
    -- Basicos da V2
    ('Leite',                       5.99,  'Laticinios',        'laticinio'),
    ('Iogurte',                     3.90,  'Laticinios',        'laticinio'),
    ('Queijo Mussarela',           39.90,  'Frios e Embutidos', 'frios'),
    ('Queijo Minas',               34.90,  'Frios e Embutidos', 'frios'),
    ('Manteiga',                   12.90,  'Laticinios',        'laticinio'),
    ('Requeijao',                  10.90,  'Laticinios',        'laticinio'),
    ('Pao Integral',                7.49,  'Padaria',           'padaria'),
    ('Pao Frances',                 0.60,  'Padaria',           'padaria'),
    ('Arroz',                      22.90,  'Massas e Cereais',  'basico'),
    ('Feijao Carioca',             10.90,  'Massas e Cereais',  'basico'),
    ('Feijao Preto',               10.90,  'Massas e Cereais',  'basico'),
    ('Tomate',                      7.90,  'Hortifruti',        'hortifruti'),
    ('Batata',                      5.90,  'Hortifruti',        'hortifruti'),
    ('Cenoura',                     5.50,  'Hortifruti',        'hortifruti'),
    ('Banana',                      6.90,  'Hortifruti',        'fruta'),
    ('Maca',                        8.90,  'Hortifruti',        'fruta'),
    ('Laranja',                     6.90,  'Hortifruti',        'fruta'),
    ('Limao',                       5.50,  'Hortifruti',        'fruta'),
    ('Cafe',                        9.90,  'Bebidas',            'bebida'),
    ('Sabonete',                    2.99,  'Higiene',           'higiene'),
    ('Detergente',                  3.99,  'Limpeza',           'limpeza'),
    ('Amaciante',                  16.90,  'Limpeza',           'limpeza'),
    ('Desinfetante',                8.90,  'Limpeza',           'limpeza'),
    ('Alcool 70%',                  7.90,  'Limpeza',           'limpeza'),
    ('Saco de Lixo',                9.90,  'Limpeza',           'limpeza'),

    -- V3 - sugestoes
    ('Agua Mineral',                2.50,  'Bebidas',           'bebida,saudavel'),
    ('Suco de Laranja',             8.90,  'Bebidas',           'bebida,fruta'),
    ('Peito de Frango',            22.90,  'Carnes e Peixes',   'proteina,magro'),
    ('Fuba',                        4.50,  'Massas e Cereais',  'sem-gluten'),
    ('Arroz Integral',             24.90,  'Massas e Cereais',  'basico,integral'),
    ('Adocante',                   12.90,  'Condimentos',       'diabetes,doce'),
    ('Aveia em Flocos',             7.50,  'Massas e Cereais',  'integral,fibra'),

    -- V4 - dietas especificas
    ('Macarrao Integral',           8.90,  'Massas e Cereais',  'integral'),
    ('Adocante Dietetico',         12.50,  'Mercearia',         'diet'),
    ('Leite Desnatado',             6.90,  'Laticinios',        'laticinio,desnatado'),
    ('File de Peixe',              29.90,  'Carnes e Peixes',   'proteina,magro'),
    ('Sal Light',                   3.50,  'Condimentos',       'light'),
    ('Pao 100% Integral',           8.50,  'Padaria',           'padaria,integral'),
    ('Biscoito Integral',           6.90,  'Mercearia',         'integral,lanche'),
    ('Oleo de Canola',             17.90,  'Mercearia',         'gordura_boas'),
    ('Castanha de Caju',           29.90,  'Mercearia',         'oleaginosa'),
    ('Nozes',                      34.90,  'Mercearia',         'oleaginosa'),
    ('Maca Verde',                  9.90,  'Hortifruti',        'fruta'),
    ('Mamao',                       7.90,  'Hortifruti',        'fruta'),
    ('Abobrinha',                   6.50,  'Hortifruti',        'hortifruti'),
    ('Brocolis',                    9.50,  'Hortifruti',        'hortifruti'),
    ('Couve-flor',                  9.50,  'Hortifruti',        'hortifruti'),

    -- V7 - substitutos mais realistas
    ('Leite Sem Lactose Integral',  6.90,  'Laticinios',        'laticinio,sem-lactose'),
    ('Leite Sem Lactose Desnatado', 7.20,  'Laticinios',        'laticinio,sem-lactose,desnatado'),
    ('Iogurte Sem Lactose',         4.90,  'Laticinios',        'laticinio,sem-lactose'),
    ('Queijo Minas Sem Lactose',   39.90,  'Frios e Embutidos', 'frios,sem-lactose'),
    ('Pao Sem Gluten',             10.90,  'Padaria',           'padaria,sem-gluten'),
    ('Macarrao Sem Gluten',         9.90,  'Massas e Cereais',  'massa,sem-gluten'),
    ('Tempero Natural sem Sal',     5.90,  'Condimentos',       'tempero,sem-sal,hipertensao'),
    ('Refrigerante Zero',           7.90,  'Bebidas',           'bebida,zero-acucar,diabetes'),
    ('Achocolatado Diet',          12.90,  'Bebidas',           'bebida,diet,diabetes'),

    -- V8 - basicos adicionais
    ('Acucar',                      4.50,  'Mercearia',         'acucar,doce'),
    ('Farinha de Trigo',            4.99,  'Massas e Cereais',  'farinha'),
    ('Oleo de Soja',                7.49,  'Mercearia',         'oleo,cozinha'),
    ('Macarrao Espaguete',          5.99,  'Massas e Cereais',  'massa,espaguete'),
    ('Arroz Parboilizado',         23.90,  'Massas e Cereais',  'basico,arroz'),
    ('Fuba de Milho',               4.90,  'Massas e Cereais',  'fuba,mingau'),
    ('Ovos',                       14.90,  'Mercearia',         'ovos,proteina'),
    ('Milho Verde em Lata',         4.90,  'Enlatados',         'enlatado,legume'),
    ('Ervilha em Lata',             4.90,  'Enlatados',         'enlatado,legume'),
    ('Molho de Tomate',             3.50,  'Enlatados',         'molho,tomate'),
    ('Extrato de Tomate',           3.90,  'Enlatados',         'molho,tomate'),
    ('Sal',                         2.50,  'Condimentos',       'sal,temperar'),
    ('Ketchup',                     8.90,  'Condimentos',       'molho,ketchup'),
    ('Maionese',                    9.90,  'Condimentos',       'molho,maionese'),
    ('Refrigerante',                8.90,  'Bebidas',           'bebida,acucar'),
    ('Achocolatado',                7.90,  'Bebidas',           'achocolatado,acucar'),
    ('Cha Preto',                   5.90,  'Bebidas',           'cha,cafeina'),
    ('Papel Higienico',            15.90,  'Higiene',           'papel,sanitario'),
    ('Pasta de Dente',              5.50,  'Higiene',           'dental,pasta'),
    ('Escova de Dente',             4.50,  'Higiene',           'dental,escova'),
    ('Shampoo',                    12.90,  'Higiene',           'cabelo,shampoo'),
    ('Condicionador',              14.90,  'Higiene',           'cabelo,condicionador'),
    ('Desodorante',                11.90,  'Higiene',           'desodorante,higiene'),
    ('Sabao em Po',                18.90,  'Limpeza',           'lavar_roupa,sabao'),
    ('Sabao em Barra',              5.90,  'Limpeza',           'sabao,barra'),
    ('Esponja de Aco',              2.50,  'Limpeza',           'esponja,aco'),
    ('Esponja Multiuso',            2.50,  'Limpeza',           'esponja,cozinha'),
    ('Presunto',                   34.90,  'Frios e Embutidos', 'presunto,embutido'),
    ('Linguica',                   19.90,  'Frios e Embutidos', 'linguica,embutido'),
    ('Carne Moida Bovina',         29.90,  'Carnes e Peixes',   'carne,bovina'),
    ('Coxa de Frango',             17.90,  'Carnes e Peixes',   'carne,frango'),
    ('Mel',                        12.90,  'Mercearia',         'mel,doce,natural')
)
INSERT INTO lista_compras.produto (
  nome, nome_normalizado, preco, ativo, is_personalizado, tags, categoria_id, created_at, updated_at
)
SELECT
  p.nome,
  public.unaccent(LOWER(p.nome)),
  p.preco,
  TRUE,
  FALSE,
  p.tags,
  (SELECT id FROM lista_compras.categorias c WHERE c.nome = p.cat LIMIT 1),
  NOW(),
  NOW()
FROM p
WHERE NOT EXISTS (SELECT 1 FROM lista_compras.produto pr WHERE pr.nome = p.nome);

-- ----------------------------------------------------------------------------
-- 3) PATOLOGIAS
-- ----------------------------------------------------------------------------

INSERT INTO lista_compras.patologias (nome, descricao, created_at, updated_at)
VALUES
  ('Intolerancia a Lactose', 'Dificuldade de digerir lactose',         NOW(), NOW()),
  ('Hipertensao',            'Pressao arterial elevada',               NOW(), NOW()),
  ('Diabetes Mellitus',      'Problemas no metabolismo da glicose',    NOW(), NOW()),
  ('Doenca Celiaca',         'Intolerancia ao gluten',                 NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4) VINCULOS PATOLOGIA <-> PRODUTO (com sugestao de substituicao)
-- ----------------------------------------------------------------------------

-- 4.1) INTOLERANCIA A LACTOSE
INSERT INTO lista_compras.patologia_itens (created_at, updated_at, patologia_id, produto_id, produto_sugestao_id)
SELECT NOW(), NOW(),
       (SELECT id FROM lista_compras.patologias WHERE nome = 'Intolerancia a Lactose'),
       p.id,
       sug.id
FROM lista_compras.produto p
JOIN (VALUES
  ('Leite',             'Leite Sem Lactose Integral'),
  ('Iogurte',           'Iogurte Sem Lactose'),
  ('Queijo Mussarela',  'Queijo Minas Sem Lactose'),
  ('Queijo Minas',      'Queijo Minas Sem Lactose'),
  ('Requeijao',         'Queijo Minas Sem Lactose'),
  ('Manteiga',          'Queijo Minas Sem Lactose'),
  ('Leite Desnatado',   'Leite Sem Lactose Desnatado')
) AS m(produto_nome, sugestao_nome) ON m.produto_nome = p.nome
LEFT JOIN lista_compras.produto sug ON sug.nome = m.sugestao_nome
WHERE NOT EXISTS (
  SELECT 1 FROM lista_compras.patologia_itens pi
  WHERE pi.patologia_id = (SELECT id FROM lista_compras.patologias WHERE nome = 'Intolerancia a Lactose')
    AND pi.produto_id = p.id
);

-- 4.2) HIPERTENSAO
INSERT INTO lista_compras.patologia_itens (created_at, updated_at, patologia_id, produto_id, produto_sugestao_id)
SELECT NOW(), NOW(),
       (SELECT id FROM lista_compras.patologias WHERE nome = 'Hipertensao'),
       p.id,
       sug.id
FROM lista_compras.produto p
JOIN (VALUES
  ('Sal',      'Tempero Natural sem Sal'),
  ('Linguica', 'Peito de Frango'),
  ('Presunto', 'Peito de Frango'),
  ('Sal Light','Tempero Natural sem Sal')
) AS m(produto_nome, sugestao_nome) ON m.produto_nome = p.nome
LEFT JOIN lista_compras.produto sug ON sug.nome = m.sugestao_nome
WHERE NOT EXISTS (
  SELECT 1 FROM lista_compras.patologia_itens pi
  WHERE pi.patologia_id = (SELECT id FROM lista_compras.patologias WHERE nome = 'Hipertensao')
    AND pi.produto_id = p.id
);

-- 4.3) DIABETES MELLITUS
INSERT INTO lista_compras.patologia_itens (created_at, updated_at, patologia_id, produto_id, produto_sugestao_id)
SELECT NOW(), NOW(),
       (SELECT id FROM lista_compras.patologias WHERE nome = 'Diabetes Mellitus'),
       p.id,
       sug.id
FROM lista_compras.produto p
JOIN (VALUES
  ('Acucar',       'Adocante Dietetico'),
  ('Refrigerante', 'Refrigerante Zero'),
  ('Achocolatado', 'Achocolatado Diet'),
  ('Mel',          'Adocante Dietetico')
) AS m(produto_nome, sugestao_nome) ON m.produto_nome = p.nome
LEFT JOIN lista_compras.produto sug ON sug.nome = m.sugestao_nome
WHERE NOT EXISTS (
  SELECT 1 FROM lista_compras.patologia_itens pi
  WHERE pi.patologia_id = (SELECT id FROM lista_compras.patologias WHERE nome = 'Diabetes Mellitus')
    AND pi.produto_id = p.id
);

-- 4.4) DOENCA CELIACA (GLUTEN)
INSERT INTO lista_compras.patologia_itens (created_at, updated_at, patologia_id, produto_id, produto_sugestao_id)
SELECT NOW(), NOW(),
       (SELECT id FROM lista_compras.patologias WHERE nome = 'Doenca Celiaca'),
       p.id,
       sug.id
FROM lista_compras.produto p
JOIN (VALUES
  ('Pao Frances',       'Pao Sem Gluten'),
  ('Macarrao Integral', 'Macarrao Sem Gluten')
) AS m(produto_nome, sugestao_nome) ON m.produto_nome = p.nome
LEFT JOIN lista_compras.produto sug ON sug.nome = m.sugestao_nome
WHERE NOT EXISTS (
  SELECT 1 FROM lista_compras.patologia_itens pi
  WHERE pi.patologia_id = (SELECT id FROM lista_compras.patologias WHERE nome = 'Doenca Celiaca')
    AND pi.produto_id = p.id
);

-- ----------------------------------------------------------------------------
-- 5) USUARIO DE EXEMPLO COM PATOLOGIAS
--    usuario_id=2 corresponde ao usuario 'idoso' criado pelo DataInitializer
--    da plataforma. Ajuste o ID conforme o seu ambiente.
-- ----------------------------------------------------------------------------

INSERT INTO lista_compras.usuario_patologias (usuario_id, patologia_id, created_at, updated_at)
SELECT 2, pat.id, NOW(), NOW()
FROM lista_compras.patologias pat
WHERE pat.nome IN ('Intolerancia a Lactose', 'Hipertensao')
  AND NOT EXISTS (
    SELECT 1 FROM lista_compras.usuario_patologias up
    WHERE up.usuario_id = 2 AND up.patologia_id = pat.id
  );

-- ----------------------------------------------------------------------------
-- 6) TEMPLATES (listas modelo) - usuario_id=1 (admin) como dono nominal
-- ----------------------------------------------------------------------------

INSERT INTO lista_compras.lista (usuario_id, titulo, is_template, status, patologia_id, created_at)
SELECT 1, t.titulo, TRUE, 'ABERTA', t.patologia_id, NOW()
FROM (VALUES
  ('Dieta Intolerancia a Lactose',
    (SELECT id FROM lista_compras.patologias WHERE nome = 'Intolerancia a Lactose')),
  ('Dieta Hipertensao',
    (SELECT id FROM lista_compras.patologias WHERE nome = 'Hipertensao')),
  ('Dieta Diabetes Mellitus',
    (SELECT id FROM lista_compras.patologias WHERE nome = 'Diabetes Mellitus'))
) AS t(titulo, patologia_id)
WHERE NOT EXISTS (
  SELECT 1 FROM lista_compras.lista l
  WHERE l.titulo = t.titulo AND l.is_template = TRUE
);

-- 6.1) Itens da dieta Intolerancia a Lactose
INSERT INTO lista_compras.lista_item (lista_id, produto_id, qtd, created_at)
SELECT
  (SELECT id FROM lista_compras.lista WHERE titulo = 'Dieta Intolerancia a Lactose' AND is_template = TRUE LIMIT 1),
  p.id, 1, NOW()
FROM lista_compras.produto p
WHERE p.nome IN (
  'Arroz','Feijao Carioca','Feijao Preto','Arroz Integral','Macarrao Integral',
  'Tomate','Batata','Cenoura','Banana','Maca','Maca Verde','Laranja','Limao',
  'Mamao','Abobrinha','Brocolis','Couve-flor',
  'Pao Integral','Pao 100% Integral','Biscoito Integral',
  'Peito de Frango','File de Peixe','Aveia em Flocos','Castanha de Caju','Nozes'
)
ON CONFLICT DO NOTHING;

-- 6.2) Itens da dieta Hipertensao
INSERT INTO lista_compras.lista_item (lista_id, produto_id, qtd, created_at)
SELECT
  (SELECT id FROM lista_compras.lista WHERE titulo = 'Dieta Hipertensao' AND is_template = TRUE LIMIT 1),
  p.id, 1, NOW()
FROM lista_compras.produto p
WHERE p.nome IN (
  'Arroz','Feijao Carioca','Feijao Preto','Arroz Integral','Tomate','Batata','Cenoura',
  'Banana','Maca','Maca Verde','Laranja','Limao','Mamao','Abobrinha','Brocolis','Couve-flor',
  'Aveia em Flocos','Oleo de Canola','Peito de Frango','File de Peixe',
  'Sal Light','Castanha de Caju','Nozes'
)
ON CONFLICT DO NOTHING;

-- 6.3) Itens da dieta Diabetes Mellitus
INSERT INTO lista_compras.lista_item (lista_id, produto_id, qtd, created_at)
SELECT
  (SELECT id FROM lista_compras.lista WHERE titulo = 'Dieta Diabetes Mellitus' AND is_template = TRUE LIMIT 1),
  p.id, 1, NOW()
FROM lista_compras.produto p
WHERE p.nome IN (
  'Arroz Integral','Feijao Carioca','Aveia em Flocos',
  'Pao Integral','Pao 100% Integral','Biscoito Integral',
  'Tomate','Cenoura','Abobrinha','Brocolis','Couve-flor',
  'Banana','Maca','Maca Verde','Laranja','Mamao',
  'Leite Desnatado','Peito de Frango','File de Peixe',
  'Adocante Dietetico','Castanha de Caju','Nozes'
)
ON CONFLICT DO NOTHING;
