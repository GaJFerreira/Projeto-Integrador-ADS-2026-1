# `ListaComprasDataInitializer` — Manual de Uso & Documentação Técnica

> Inicialização automática do catálogo do módulo **Lista de Compras** no boot do backend, sem dependência de scripts SQL manuais.

---

## 1. Visão geral

O `ListaComprasDataInitializer` é um `CommandLineRunner` do Spring Boot que executa, no boot da aplicação, a carga base do schema `lista_compras` a partir de um script SQL versionado no classpath do módulo.

**Por que existe?**
O projeto não possui servidor de banco compartilhado — cada desenvolvedor (e o avaliador final) usa um Postgres local. Antes desse componente, era necessário rodar manualmente o `script-massa-dados.sql` em cada máquina para o módulo operar corretamente. Agora não é mais.

**Resultado:**
Clonou o repositório, configurou Postgres local, subiu o backend → o módulo está pronto para uso, com catálogo, patologias, templates de dieta e o usuário de exemplo (`idoso`) já vinculado às suas patologias.

---

## 2. O que é populado

Ao final da primeira execução, o schema `lista_compras` contém:

| Recurso | Quantidade | Observação |
|---|---|---|
| `categorias` | **12** | Laticínios, Padaria, Mercearia, Hortifruti, Bebidas, Limpeza, Higiene, Enlatados, Condimentos, Massas e Cereais, Frios e Embutidos, Carnes e Peixes |
| `produto` | **~87** | Catálogo de básicos (arroz, feijão, frango…) + substitutos para dietas específicas (sem lactose, sem glúten, diet) |
| `patologias` | **4** | Intolerância a Lactose, Hipertensão, Diabetes Mellitus, Doença Celíaca |
| `patologia_itens` | **17** | Vínculos *produto-alertado → produto-sugestão* (ex.: Leite → Leite Sem Lactose) |
| `usuario_patologias` | **2** | Usuário `idoso` vinculado a Intolerância a Lactose + Hipertensão |
| `lista` (templates) | **3** | Dieta Intolerância a Lactose, Dieta Hipertensão, Dieta Diabetes Mellitus |
| `lista_item` | **70** | Itens distribuídos nos 3 templates (25 + 23 + 22) |

E em `public`:

| Recurso | Para que serve |
|---|---|
| Extensão `unaccent` | Habilita normalização de acentos no Postgres |
| Função `public.f_unaccent(text)` | Usada por `ProdutoRepository.findByNomeNormalizado` para busca sem acentos |
| Índice `idx_produto_nome_unaccent` | Acelera a busca acima |

---

## 3. Como funciona

### 3.1 Fluxo no boot

```
1. Spring Boot inicializa o contexto
2. JPA / Hibernate aplica ddl-auto=update (cria/atualiza tabelas)
3. CommandLineRunners executam, em ordem de @Order:
   3.1. DataInitializer da plataforma  → cria users admin e idoso
   3.2. (outros CommandLineRunners)
   3.3. ListaComprasDataInitializer    → @Order(LOWEST_PRECEDENCE), roda por último
        a) garantirExtensaoUnaccent()  → CREATE EXTENSION / FUNCTION / INDEX
        b) executarSeed()              → ScriptUtils.executeSqlScript(seed.sql)
        c) logResumo()                 → loga contagens finais
```

### 3.2 Estrutura de arquivos

```
backend/modules/lista-compras/
├── src/main/java/.../config/
│   └── ListaComprasDataInitializer.java   # o runner (CommandLineRunner)
├── src/main/resources/
│   └── db/seed/
│       └── lista-compras-seed.sql         # massa de dados (empacotada no JAR)
└── docs/database/
    ├── script-massa-dados.sql              # documento de referência histórica
    └── DATA_INITIALIZER.md                 # este arquivo
```

### 3.3 Características técnicas

| Característica | Como é garantida |
|---|---|
| **Roda automaticamente** | `@Component` + `implements CommandLineRunner` |
| **Roda por último** | `@Order(Ordered.LOWEST_PRECEDENCE)` — garante que users de teste da plataforma já existem |
| **Ligado por padrão** | `@ConditionalOnProperty(matchIfMissing = true)` — não exige nenhuma property |
| **Idempotente** | SQL usa `WHERE NOT EXISTS` + `ON CONFLICT DO NOTHING` em todos os INSERTs |
| **Resiliente a IDs variáveis** | Resolve usuários por `username` (`SELECT id FROM plataforma.users WHERE username = 'idoso'`) |
| **Defensivo** | Bloco `try/catch` no `run(...)`: qualquer falha vira `WARN`, **não derruba a aplicação** |
| **Isolado** | Escreve apenas em `lista_compras.*` e cria função utilitária em `public` |
| **Sem alteração na plataforma** | Default ativo via `matchIfMissing = true`, sem property no `application.properties` da plataforma |

### 3.4 Decisão arquitetural: por que DDL `unaccent` está no Java, não no SQL?

A função `f_unaccent` usa **dollar-quoting** do Postgres (`$$ ... $$`), que pode confundir o parser do `ScriptUtils` do Spring (ele divide statements por `;` por padrão). Para evitar problemas:

- DDL com dollar-quoting → executados via `JdbcTemplate.execute(...)` direto, um por um.
- INSERTs e statements normais → carregados do `.sql` e executados via `ScriptUtils.executeSqlScript`.

---

## 4. Como usar

### 4.1 Uso normal (developer ou avaliador)

1. Configure Postgres local: banco `projeto_integrador`, usuário com senha conforme `application.properties` da plataforma.
2. Suba o backend a partir da plataforma:
   ```powershell
   cd backend\plataforma
   mvnd spring-boot:run
   ```
3. **Pronto.** No primeiro boot você verá no log:

   ```
   INFO  ListaComprasDataInitializer : seed aplicado — categorias=12, produtos=87, patologias=4, templates=3.
   ```

4. Nos boots seguintes, o initializer continua rodando, mas o SQL não insere nada (idempotência):

   ```
   INFO  ListaComprasDataInitializer : seed aplicado — categorias=12, produtos=87, patologias=4, templates=3.
   ```

### 4.2 Desligar o seed (raro — apenas para troubleshooting)

Via variável de ambiente (recomendado, não suja o repositório):

```powershell
$env:LISTACOMPRAS_SEED_ENABLED = 'false'
mvnd spring-boot:run
```

Ou via property no `application.properties` da plataforma:

```properties
listacompras.seed.enabled=false
```

### 4.3 Limpar e re-popular do zero

```sql
TRUNCATE TABLE
  lista_compras.lista_item,
  lista_compras.lista,
  lista_compras.usuario_patologias,
  lista_compras.patologia_itens,
  lista_compras.patologias,
  lista_compras.produto,
  lista_compras.categorias
RESTART IDENTITY CASCADE;
```

No próximo boot, o initializer repopula tudo automaticamente.

### 4.4 Rodar o SQL manualmente (debug, ambiente sem Spring)

O arquivo `src/main/resources/db/seed/lista-compras-seed.sql` é executável diretamente via `psql`:

```powershell
$env:PGPASSWORD = '<sua-senha>'
psql -U postgres -h localhost -d projeto_integrador -f backend\modules\lista-compras\src\main\resources\db\seed\lista-compras-seed.sql
```

Antes, é necessário criar a função `f_unaccent` manualmente:

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE OR REPLACE FUNCTION public.f_unaccent(text) RETURNS text
  AS $$ SELECT public.unaccent('public.unaccent', $1) $$ LANGUAGE sql IMMUTABLE;
```

---

## 5. Como estender o catálogo

### 5.1 Adicionar produtos

Edite `src/main/resources/db/seed/lista-compras-seed.sql` na seção **2) PRODUTOS**, adicionando linhas no bloco `VALUES`:

```sql
('Novo Produto', 9.90, 'Hortifruti', 'tag1,tag2'),
```

O `INSERT ... WHERE NOT EXISTS` ignora produtos já presentes no banco — só os novos serão inseridos no próximo boot.

### 5.2 Adicionar categoria

Bloco **1) CATEGORIAS**:

```sql
('Nova Categoria', 'Descricao da nova categoria'),
```

### 5.3 Adicionar patologia e vínculos

Bloco **3) PATOLOGIAS** + bloco **4)** copiando o padrão de uma das patologias existentes (substitua o nome da patologia e a lista de `(produto, sugestao)`).

### 5.4 Editar templates de dieta

Bloco **6)** — adicione o template e crie sua sub-seção (`6.X) Itens da dieta Nome`) com a lista de produtos.

> ⚠️ Após editar o `.sql`, é necessário rebuildar o módulo (`mvnd install`) para o arquivo atualizado ir para o JAR.

---

## 6. Troubleshooting

### "function public.f_unaccent does not exist"
A função não foi criada. Possíveis causas:
- A extensão `unaccent` não está disponível na instalação do Postgres. Solução: instalar o pacote `postgresql-contrib`.
- O usuário do banco não tem permissão para `CREATE EXTENSION`. Solução: rodar a função manualmente como `postgres`/superuser, ou conceder a permissão.

### "ListaComprasDataInitializer ignorado por falha não crítica: …"
O seed encontrou um erro mas a aplicação continua subindo. Verifique o log completo — geralmente é um problema de conexão ou permissão no banco. Resolva a causa e reinicie.

### "duplicate key value violates unique constraint"
Não deveria ocorrer (todos os INSERTs são protegidos por `WHERE NOT EXISTS` ou `ON CONFLICT`). Se ocorrer, é sinal de que alguém editou o `.sql` sem manter o padrão de idempotência — revise os blocos `INSERT` para garantir que respeitam o filtro.

### Templates de dieta criados sem itens
Provável: o seed rodou **antes** do user `admin` existir (na primeiríssima inicialização, há uma race condition possível se outro `CommandLineRunner` mais lento criar `admin`). Solução: reiniciar o backend uma segunda vez — o seed é idempotente, vai criar o que falta.

### Quero validar que tudo populou
```sql
SELECT 'categorias'         AS tabela, count(*) FROM lista_compras.categorias
UNION ALL SELECT 'produtos',           count(*) FROM lista_compras.produto
UNION ALL SELECT 'patologias',         count(*) FROM lista_compras.patologias
UNION ALL SELECT 'patologia_itens',    count(*) FROM lista_compras.patologia_itens
UNION ALL SELECT 'usuario_patologias', count(*) FROM lista_compras.usuario_patologias
UNION ALL SELECT 'listas_template',    count(*) FROM lista_compras.lista WHERE is_template = TRUE
UNION ALL SELECT 'lista_itens',        count(*) FROM lista_compras.lista_item;
```

Esperado: 12 / 87 / 4 / 17 / 2 / 3 / 70 (ou maior, se houve cadastros pelo admin).

---

## 7. Conformidade com o `GUIA_VERSIONAMENTO.md`

- ✅ **Zero alteração em `backend/plataforma/`** — o seed roda por default via `matchIfMissing = true`, dispensando flag externa.
- ✅ **Zero alteração em outros módulos** — escrita exclusiva em `lista_compras.*`.
- ✅ **Schema isolado** — respeita o padrão de schema-por-módulo do projeto.
- ✅ **Sem dependência nova** — usa `spring-jdbc` (já transitivamente presente).

---

## 8. Referências

- Padrão de DataInitializer do projeto: `backend/modules/care-hub/src/main/java/.../config/CareHubDataInitializer.java`
- Spring Boot — `CommandLineRunner` e `@ConditionalOnProperty`
- Spring JDBC — `ScriptUtils.executeSqlScript`
- Dollar-quoting em PostgreSQL — [docs.postgresql.org/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING)
