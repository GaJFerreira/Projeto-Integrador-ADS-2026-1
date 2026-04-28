# 🍲 Sabor da Família

![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

## ✨ Visão geral do produto

O módulo **Sabor da Família** faz parte da Plataforma de Auxílio ao Idoso, voltada para autonomia,
bem-estar e inclusão. O objetivo do módulo é oferecer um ambiente social de receitas, com foco em
interação, memória afetiva e usabilidade simples.

### ✅ Funcionalidades disponíveis
- [x] Cadastro e edição de perfil
- [x] Publicação, edição e remoção de receitas
- [x] Restrições alimentares por perfil e receita
- [x] Personalizações de contexto (perfil e receita)
- [x] Interações sociais (seguir, curtir, comentar e favoritar)
- [x] Feed e explorar com personalização por aderência de preferências

### 🚀 Evoluções planejadas
- [ ] Mídia para receitas e perfis
- [ ] Política de moderação e governança de conteúdo
- [ ] Sistema de seguidores mais robusto (sugestões e "quem seguir")
- [ ] Compartilhamento interno (repost no feed e envio por conversa privada)

## 🎯 Contexto de negócio

O projeto surgiu para incentivar convivência e troca entre pessoas por meio de receitas e histórias.
Os objetivos de negócio principais são:
- aumentar a relevância do conteúdo para cada usuário
- estimular interação social recorrente
- facilitar o uso para público não técnico

## 🏗️ Arquitetura

Visão rápida da base tecnológica e da organização da aplicação.

Stack principal:
- Java 21
- Spring Boot 3
- PostgreSQL
- OpenAPI/Swagger

Estrutura de camadas:
- `controller`: endpoints HTTP
- `service`: regras de negócio e orquestração
- `database/repository`: acesso ao banco
- `database/entity`: mapeamento JPA
- `service/.../dto`: contratos de entrada e saída
- `exception`: tratamento padronizado de erros

## 🧩 Domínios principais

Principais contextos de negócio do módulo:

- **Perfil**: dados do usuário, preferências e vínculos sociais
- **Receita**: conteúdo principal compartilhado
- **Restrição alimentar**: catálogo com status ativo/inativo
- **Personalização**: catálogo para contexto de perfil/receita
- **Interações**: curtida, comentário, favorito, seguindo
- **Feed/Explorar**: descoberta de receitas

## 📐 Padrões adotados no projeto

### 🧠 Regras de negócio e validação
- Validações de códigos de catálogo ficam no `service` (não no `controller`).
- Entradas inválidas de negócio retornam `ServiceException` (HTTP 400).
- Busca de recurso inexistente retorna `ResourceNotFoundException` (HTTP 404).

### 🔄 Persistência e sincronização
- Relações N:N (perfil/receita com restrições/personalizações) usam sincronização por substituição: remove vínculos antigos e grava os novos.
- Em fluxos de criação/edição, os códigos são validados antes de persistir os vínculos.

### 🔌 API e contratos
- Endpoints REST seguem padrão por recurso (`/perfil`, `/receita`, `/personalizacao`, `/restricao-alimentar`).
- Header `X-User-Id` é obrigatório nos fluxos autenticados atuais.
- Artefatos externos (Postman/DBML/scripts) devem ser atualizados junto com mudança de contrato.

### 📊 Observabilidade
- Logs de serviço seguem padrão simples: início, rejeição relevante e sucesso.
- Evitar logar dados sensíveis.

## 🔍 Fluxo de personalização no explorar

No endpoint de explorar:
- o sistema usa as personalizações do perfil do usuário
- prioriza receitas com maior quantidade de matches
- em empate, ordena por receita mais recente

Sem preferências no perfil, o explorar usa ordenação por recência.

## ⚙️ Como rodar localmente

Guia rápido para execução local do backend.

### 🧱 Pré-requisitos
- JDK 21
- Maven 3.9+
- PostgreSQL

### 🌱 Variáveis de ambiente
- `DB_URL`
- `DB_USER`
- `DB_PASS`

Exemplo:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/sabor_familia
export DB_USER=postgres
export DB_PASS=postgres
```

### ▶️ Executar aplicação

```bash
mvn spring-boot:run
```

Base URL local:
```
http://localhost:8080/api/sabor-familia
```

Swagger:
```
http://localhost:8080/api/sabor-familia/swagger-ui.html
```

## 🗃️ Banco de dados e artefatos

Arquivos principais:
- `docs/database/script-massa-dados-postgres.sql`
- `docs/database/diagrama-entidade-relacionamento.dbml`
- `docs/postman/sabor-familia.postman_collection.json`

Observação:
- Em ambiente local, o projeto usa `ddl-auto: update`.
- Para ambientes estáveis, prefira migrações versionadas.

## 🧭 Onboarding rápido

1. Subir a aplicação local e abrir o Swagger.
2. Importar a collection do Postman.
3. Executar fluxos básicos: criar perfil, criar receita, explorar, curtir e favoritar.
4. Ler os serviços centrais:
   - `PerfilServiceImpl`
   - `ReceitaServiceImpl`
   - `PersonalizacaoServiceImpl`
   - `RestricaoAlimentarServiceImpl`
5. Revisar o DBML para entender os relacionamentos.