# Modulo: Compre com Saude (lista-compras)

Modulo responsavel por gerenciar listas de compras com alertas e sugestoes
baseadas nas patologias dos usuarios (intolerancia a lactose, hipertensao,
diabetes, doenca celiaca, ...).

## Arquitetura

- **Pacote raiz:** `br.com.puc.listacompras`
- **GroupId / ArtifactId:** `br.com.puc:lista-compras`
- **Schema BD:** `lista_compras`
- **Empacotamento:** JAR (sem `@SpringBootApplication`). O modulo so executa
  embutido na aplicacao `plataforma`.
- **Padrao seguido:** mesmo padrao do `sabor-familia`:
  - Sem `import` da `plataforma`. Referencia ao usuario apenas por
    `Long usuarioId` (claim do token JWT).
  - JWT validado pelo filtro da plataforma. O `userId` e extraido do header
    `Authorization` via `JwtClaimsUtils`.
  - Exception handling local via `ApplicationExceptionHandler` (`@ControllerAdvice`).

## Endpoints

Base: `/api/lista-compras`

### Listas
- `POST   /listas` - cria lista (titulo + itens + patologia opcional)
- `GET    /listas` - lista as listas (nao-template) do usuario autenticado
- `GET    /listas/templates` - lista templates compativeis com as patologias do usuario
- `GET    /listas/{id}` - busca uma lista por ID
- `PUT    /listas/{id}` - atualiza uma lista (titulo, itens, patologia)
- `PUT    /listas/{id}/finalizar` - finaliza (arquiva) a lista
- `PUT    /listas/{id}/reabrir` - reabre a lista
- `DELETE /listas/{id}` - remove a lista (templates nao podem ser deletados)

### Produtos
- `GET    /produtos` - lista produtos ativos
- `GET    /produtos/buscar?param={termo}` - autocomplete por nome (>= 3 chars)
- `GET    /produtos/{id}/relacionados` - produtos relacionados (afinidade)
- `GET    /produtos/{id}/substituiveis` - sugestoes para o usuario autenticado
- `GET    /produtos/{id}/substituiveis-por-patologia?patologiaId={id}` - sugestoes
  para uma patologia especifica (usado nos templates)

### Patologias
- `GET    /patologias` - patologias do usuario autenticado
- `GET    /patologias/{id}` - detalhes de uma patologia

### Patologia-Itens
- `POST   /patologia-itens` - vincula produto a patologia (com sugestao opcional)
- `GET    /patologia-itens/patologia/{patologiaId}` - lista vinculos de uma patologia

Documentacao Swagger: `http://localhost:8080/api/lista-compras/swagger-ui.html`

## Como executar

1. **Subir o backend (plataforma) ao menos uma vez** para o Hibernate criar
   o schema/tabelas (`spring.jpa.hibernate.ddl-auto=create-drop`):
   ```bash
   cd backend/plataforma
   ./mvnw spring-boot:run
   ```

2. **Carregar massa de dados** (categorias, produtos, patologias e templates):
   - Conecte no banco `projeto_integrador` (Postgres em `localhost:5432`).
   - Execute `backend/modules/lista-compras/docs/database/script-massa-dados.sql`.
   - Reexecute o script a cada restart do backend (porque `ddl-auto=create-drop`
     recria as tabelas).

3. **Subir o frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Login na plataforma (padrao: `admin` / `123456`) e acessar
   "Lista de Compras" (`/lista-compras`).

## Tabelas

Todas as tabelas vivem no schema `lista_compras`:

- `categorias` - catalogo de categorias
- `produto` - catalogo de produtos
- `lista` - listas de compras (e templates quando `is_template = true`)
- `lista_item` - itens da lista (chave composta `lista_id + produto_id`)
- `patologias` - catalogo de patologias
- `patologia_itens` - vinculo N:N entre produto e patologia, com sugestao opcional
- `usuario_patologias` - patologias declaradas pelo usuario (`usuario_id` e opaco)
- `produto_relacionado` - afinidade entre produtos
- `historico_compras` - co-ocorrencia de produtos comprados (uso futuro)

## Decisoes de migracao (origem: ProjetoIntegrador_CompreComSaude)

- Removidas as `@ManyToOne User` de Lista, UsuarioPatologia e HistoricoCompra:
  agora usam `Long usuarioId` opaco (padrao do `sabor-familia`).
- Substituido o try/catch que retornava `{"erro": msg}` nos controllers pelo
  `ApplicationExceptionHandler` (`ApiError` retornando `message`, padrao da plataforma).
- Trocada a sintaxe HQL `LIMIT :limit` em `ProdutoRelacionadoRepository` por
  `Pageable`, que e portatil.
- Migrations Flyway V2-V8 consolidadas em um unico
  `docs/database/script-massa-dados.sql` apontando para o schema `lista_compras`.
- Endpoints reorganizados para o prefixo padrao `/api/lista-compras`.
