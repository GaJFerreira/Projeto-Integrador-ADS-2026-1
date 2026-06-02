# Hotfix — Autocomplete de produtos (busca por nome)

## Resumo
A busca de produtos do autocomplete (`GET /api/lista-compras/produtos/buscar`)
estava retornando **500 Internal Server Error**, quebrando o campo "Adicionar item"
da tela de lista de compras (toast: *"Erro ao buscar produtos para autocomplete."*).

## Causa raiz
O método `ProdutoRepository.findByNomeNormalizado` usava uma **query nativa** que
dependia da função `public.f_unaccent` e da extensão `unaccent` do PostgreSQL:

```sql
SELECT * FROM lista_compras.produto
WHERE public.f_unaccent(nome_normalizado) LIKE public.f_unaccent(CONCAT('%', LOWER(?), '%'))
  AND ativo = true
```

Essa função/extensão só é criada se alguém executa **manualmente** o script
`docs/database/script-massa-dados.sql`. Em ambientes onde a massa de dados vem do
`ListaComprasDataInitializer` (Java), a função não existe, gerando:

```
SQL Error: 0, SQLState: 3F000
ERRO: o esquema "public" não existe
```

## Por que dava pra simplificar
O campo `nome_normalizado` **já é gravado sem acento e em minúsculas** em todos os
caminhos de escrita (`ProdutoService`, `AdminProdutoService`, `ListaComprasDataInitializer`),
via `Normalizer.normalize(..., NFD)` + remoção de diacríticos. Ou seja, o
`f_unaccent` sobre a coluna era **redundante** — bastava normalizar o termo de
busca em Java e comparar contra a coluna já normalizada.

## Mudanças aplicadas

| Arquivo | Mudança |
|---------|---------|
| `service/ProdutoService.java` | `buscarPorNome` agora normaliza o termo com `normalizarNome(...)` e usa a query derivada JPA. |
| `database/repository/ProdutoRepository.java` | Removido o método nativo `findByNomeNormalizado` (+ imports `@Query`/`@Param` órfãos). Passa a usar `findByNomeNormalizadoContainingAndAtivoTrue`. |
| `docs/database/script-massa-dados.sql` | `nome_normalizado` agora é inserido como `public.unaccent(LOWER(p.nome))` para alinhar a massa SQL ao comportamento do Java (busca sem acento). Comentário atualizado. |

## Comportamento após o fix
- Busca por nome continua **sem acento** e **case-insensitive** (coluna já normalizada + termo normalizado em Java).
- **Sem dependência** de extensão/função custom do PostgreSQL — funciona em qualquer ambiente, sem rodar script manual.
- Nenhum outro endpoint foi alterado; o método nativo removido só era usado pelo autocomplete.

## Validação
- Compilação do módulo: `./mvnw -o -pl backend/modules/lista-compras -am compile` → **BUILD SUCCESS**.
- Varredura: nenhuma referência remanescente a `findByNomeNormalizado` ou `f_unaccent` no código Java.
