# Módulo Elden Care — Documentação Técnica

**Projeto:** Projeto Integrador ADS 2026-1 — PUC GO  
**Módulo:** Elden Care (Plataforma de Auxílio ao Idoso)  
**Equipe:** Pedro Willian Moraes Lourenço · Tarcísio Antônio dos Santos Filho  
**Ação de extensão:** UNATI — Universidade Aberta à Terceira Idade  
**Última atualização:** 29/05/2026

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura e Integração](#2-arquitetura-e-integração)
3. [Schema do Banco de Dados](#3-schema-do-banco-de-dados)
4. [Endpoints da API](#4-endpoints-da-api)
5. [Fluxo de Uso](#5-fluxo-de-uso)
6. [Passo a Passo de Inicialização](#6-passo-a-passo-de-inicialização)
7. [Histórico de Desenvolvimento](#7-histórico-de-desenvolvimento)
8. [Pendências](#8-pendências)

---

## 1. Visão Geral

O módulo **Elden Care** é responsável pelo fluxo de geração de planos de atividades físicas personalizados para idosos. O usuário responde um questionário com 40 perguntas divididas em 8 categorias; o backend calcula um nível de risco e retorna um plano semanal adequado ao perfil do participante.

### Funcionalidades

| Funcionalidade | Status |
|---|---|
| Cadastro de participante | ✅ Implementado |
| Questionário com 40 perguntas / 8 categorias | ✅ Implementado |
| Cálculo de risco e nível de treino (BAIXO/MEDIO/ALTO) | ✅ Implementado |
| Geração de plano semanal personalizado | ✅ Implementado |
| Persistência de respostas individuais | ✅ Implementado |
| Seed automático de perguntas e exercícios no startup | ✅ Implementado |
| Visualização formatada do plano (`/view`) | ✅ Implementado |

---

## 2. Arquitetura e Integração

### Posição no monorepo

```
backend/
├── plataforma/          ← módulo pai: autenticação JWT, usuários, segurança
└── modules/
    └── elden-care/      ← este módulo
        ├── pom.xml
        └── src/main/java/br/pucgo/ads/projetointegrador/eldencare/
            ├── controller/
            ├── domain/
            ├── dto/
            ├── exception/
            ├── mapper/
            ├── repository/
            └── service/
```

### Regras de integração com a plataforma

- **Autenticação:** centralizada na plataforma. Este módulo **não** possui sistema de login próprio. Todos os endpoints protegidos exigem `Authorization: Bearer <token>` gerado pelo `POST /api/auth/login` da plataforma.
- **Banco de dados:** PostgreSQL compartilhado. O módulo usa o schema isolado `elden_care` — nenhuma tabela conflita com outros módulos.
- **Schemas:** criados automaticamente pelo `init-schemas.sql` da plataforma no startup. Nenhuma configuração manual necessária.
- **Usuário:** o módulo **não** importa a entidade `User` da plataforma. A referência ao usuário autenticado é feita via `userId` (UUID opaco) nas entidades que precisam.

### Dependência Maven

```xml
<dependency>
    <groupId>br.pucgo.ads</groupId>
    <artifactId>plataforma</artifactId>
    <version>${project.version}</version>
</dependency>
```

---

## 3. Schema do Banco de Dados

Todas as tabelas estão no schema `elden_care`.

### Diagrama de entidades

```
ex_participante
  └─< ex_resposta_questionario
        └─< ex_resposta_usuario >── ex_pergunta >── ex_opcao_pergunta
  └─< ex_plano
        └─< ex_dia_plano
              └─< ex_item_plano >── ex_exercicio
```

### Tabelas

#### `ex_participante`
Representa o idoso/participante que responde o questionário.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Gerado automaticamente |
| user_id | UUID | Referência ao usuário da plataforma (opaca, sem FK) |
| nome | VARCHAR | Nome completo — obrigatório |
| nascimento | DATE | Data de nascimento |
| sexo | VARCHAR | "M" / "F" / outro |
| peso_kg | DOUBLE | Peso em kg |
| altura_cm | DOUBLE | Altura em cm |
| observacoes | TEXT | Observações livres |

#### `ex_resposta_questionario`
Cabeçalho de uma sessão de questionário respondida.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | |
| participante_id | UUID (FK) | → ex_participante |
| created_at | TIMESTAMPTZ | Data/hora do preenchimento |

#### `ex_resposta_usuario`
Cada resposta individual de uma sessão.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | |
| response_id | UUID (FK) | → ex_resposta_questionario |
| pergunta_chave | VARCHAR | Slug da pergunta (ex: "hipertensao") |
| question_id | UUID (FK, nullable) | → ex_pergunta (quando cadastrada no banco) |
| option_code | VARCHAR | Código da resposta (ex: "sim", "nunca") |
| value_number | DOUBLE | Valor numérico quando aplicável |
| value_boolean | BOOLEAN | Valor booleano quando aplicável |

#### `ex_pergunta`
Perguntas do questionário (populadas pelo `DataSeeder` no startup).

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | |
| slug | VARCHAR (unique) | Chave textual (ex: "cansaco_ativ_leves") |
| enunciado | TEXT | Texto da pergunta |
| tipo | VARCHAR | "opcao" / "texto" / "numero" |
| categoria | VARCHAR | Categoria (ex: "cardio", "forca") |
| ordem | INTEGER | Ordem de exibição |

#### `ex_opcao_pergunta`
Opções de resposta de cada pergunta.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | |
| pergunta_id | UUID (FK) | → ex_pergunta |
| codigo | VARCHAR | Código da opção (ex: "frequente") |
| rotulo | VARCHAR | Texto exibido (ex: "Frequente") |
| ordem | INTEGER | Posição de exibição |
| created_at | TIMESTAMPTZ | |

#### `ex_plano`
Plano de atividades gerado para um participante.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | |
| participante_id | UUID (FK) | → ex_participante |
| response_id | UUID (FK, nullable) | → ex_resposta_questionario |
| mes | DATE | Mês de referência do plano |
| objetivo | VARCHAR | Ex: "Melhorar condicionamento" |
| nivel | VARCHAR | BAIXO / MEDIO / ALTO |
| freq_semana | INTEGER | Sessões por semana |
| tempo_sessao_min | INTEGER | Duração de cada sessão em minutos |

#### `ex_dia_plano`
Dias de treino do plano.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | |
| plan_id | UUID (FK) | → ex_plano |
| data_ou_ordem | TEXT | Ex: "SEGUNDA-FEIRA" |

#### `ex_item_plano`
Exercícios de um dia de treino.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | |
| day_id | UUID (FK) | → ex_dia_plano |
| exercicio_id | UUID (FK) | → ex_exercicio |
| series | INTEGER | Número de séries |
| repeticoes | INTEGER | Número de repetições |
| duracao_seg | INTEGER | Duração em segundos |
| ordem | INTEGER | Ordem dentro do dia |

#### `ex_exercicio`
Catálogo de exercícios disponíveis.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | |
| nome | VARCHAR | Nome do exercício |
| tags_json | JSONB | Ex: `{"grupo":"aerobico","tipo":"caminhada"}` |
| tempo_medio_min | INTEGER | Duração média em minutos |

---

## 4. Endpoints da API

Base URL: `http://localhost:8080`  
Todos os endpoints exigem `Authorization: Bearer <token>` — exceto indicação contrária.

### Participantes

| Método | URL | Descrição |
|---|---|---|
| `POST` | `/api/elden-care/participantes` | Cadastra novo participante |
| `GET` | `/api/elden-care/participantes` | Lista todos os participantes |
| `GET` | `/api/elden-care/participantes/{id}` | Busca participante por UUID |

**Exemplo — cadastrar participante:**
```json
POST /api/elden-care/participantes
{
  "nome": "Maria Souza",
  "nascimento": "1960-03-15",
  "sexo": "F",
  "pesoKg": 65.0,
  "alturaCm": 158.0
}
```
Resposta `201 Created`:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "nome": "Maria Souza",
  "nascimento": "1960-03-15",
  "sexo": "F",
  "pesoKg": 65.0,
  "alturaCm": 158.0,
  "userId": null,
  "observacoes": null
}
```

### Questionário

| Método | URL | Descrição |
|---|---|---|
| `GET` | `/api/elden-care/questionario/perguntas` | Retorna as 40 perguntas agrupadas por categoria |
| `POST` | `/api/elden-care/questionario/gerar` | Gera plano a partir das respostas |
| `GET` | `/api/elden-care/questionario/testar/{respostaId}` | Gera plano a partir de resposta existente (testes) |

**Exemplo — gerar plano:**
```json
POST /api/elden-care/questionario/gerar
{
  "participanteId": "550e8400-e29b-41d4-a716-446655440000",
  "respostas": [
    { "pergunta": "hipertensao",        "resposta": "nao" },
    { "pergunta": "cansaco_ativ_leves", "resposta": "as_vezes" },
    { "pergunta": "quedas_ultimo_ano",  "resposta": "nenhuma" }
  ]
}
```
Resposta `200 OK`:
```json
{
  "nome": "Maria Souza",
  "idade": 65,
  "sexo": "F",
  "semanas": 4,
  "diasSemana": 3,
  "minDia": 30,
  "tempoSemanalMin": 90,
  "nivel": "ALTO",
  "dias": [
    { "dia": "SEGUNDA-FEIRA", "atividades": ["Caminhada ao ar livre"] },
    { "dia": "QUARTA-FEIRA",  "atividades": ["Dança leve/ritmada"] },
    { "dia": "SEXTA-FEIRA",   "atividades": ["Fortalecimento de membros inferiores (cadeira)"] }
  ]
}
```

**Estrutura de `GET /perguntas`:**
```json
{
  "categorias": [
    {
      "id": "condicao",
      "titulo": "Condição física",
      "emoji": "🧩",
      "perguntas": [
        {
          "id": "uuid",
          "slug": "cansaco_ativ_leves",
          "enunciado": "Você sente cansaço em atividades leves?",
          "tipo": "opcao",
          "ordem": 1,
          "opcoes": [
            { "codigo": "nunca",     "rotulo": "Nunca" },
            { "codigo": "as_vezes",  "rotulo": "Às vezes" },
            { "codigo": "frequente", "rotulo": "Frequente" }
          ]
        }
      ]
    }
  ]
}
```

### Planos

| Método | URL | Descrição |
|---|---|---|
| `GET` | `/api/elden-care/planos/{id}` | Retorna plano completo (entidade bruta) |
| `GET` | `/api/elden-care/planos/participante/{participanteId}` | Lista planos de um participante |
| `GET` | `/api/elden-care/planos/{id}/view` | Retorna DTO formatado para exibição |

### Health Check

| Método | URL | Descrição |
|---|---|---|
| `GET` | `/api/elden-care/ping` | Verifica se o módulo está no ar |

Resposta:
```json
{ "ok": true, "service": "elden-care", "ts": "2026-05-29T14:00:00Z" }
```

---

## 5. Fluxo de Uso

```
1. Autenticação
   POST /api/auth/login  →  recebe { token: "..." }

2. Cadastrar participante
   POST /api/elden-care/participantes
   (guarda o "id" UUID retornado)

3. Carregar perguntas do questionário
   GET /api/elden-care/questionario/perguntas

4. Enviar respostas e gerar plano
   POST /api/elden-care/questionario/gerar
   { "participanteId": "<uuid>", "respostas": [...] }
   →  recebe PlanoGeradoResponse com dias e atividades

5. (Opcional) Buscar plano formatado novamente
   GET /api/elden-care/planos/<planoId>/view
```

### Lógica de nível de risco

O backend calcula uma **pontuação de risco** com base nas respostas:

| Pontuação total | Nível | Intensidade do treino |
|---|---|---|
| < 6 | ALTO | Maior intensidade — sem restrições relevantes |
| 6 – 11 | MEDIO | Moderado — atenção a comorbidades |
| ≥ 12 | BAIXO | Leve — priorizando segurança |

**Fatores que aumentam o risco:**
- Hipertensão não controlada (+4)
- Problema cardíaco (+5)
- Doença respiratória (+3)
- Médico limitou esforço (+4)
- 2 ou mais quedas no último ano (+4)
- Cansaço frequente em atividades leves (+6)

**Exercícios por nível:**

| Nível | Segunda | Quarta | Sexta |
|---|---|---|---|
| ALTO | Caminhada ao ar livre | Dança leve/ritmada | Fortalecimento MMII |
| MEDIO | Caminhada ao ar livre | Mobilidade quadril/tornozelo | Dança leve/ritmada |
| BAIXO | Caminhada ao ar livre | Alongamentos suaves (sentado) | Mobilidade quadril/tornozelo |

---

## 6. Passo a Passo de Inicialização

### Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Java | 21 |
| Maven | 3.8+ (ou usar `mvnw`) |
| PostgreSQL | 14+ rodando na porta **5432** |

> ⚠️ **Atenção:** O projeto integrador usa a porta **5432** (padrão do PostgreSQL). Se você usava o módulo `elder_care` standalone antes, ele usava a **5433** — são configurações diferentes.

---

### Etapa 1 — Preparar o banco de dados

Conecte ao PostgreSQL e crie o banco (caso não exista):

```sql
CREATE DATABASE projeto_integrador;
```

Os **schemas** (`elden_care`, `plataforma`, `sabor_familia`, etc.) são criados **automaticamente** pelo `init-schemas.sql` na primeira vez que a plataforma sobe. Nenhuma ação manual necessária.

---

### Etapa 2 — Verificar `application.properties`

Arquivo: `backend/plataforma/src/main/resources/application.properties`

Confirme que as credenciais correspondem ao seu PostgreSQL:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/projeto_integrador
spring.datasource.username=postgres
spring.datasource.password=postgres
```

Se precisar alterar a senha, edite somente o `application.properties` — não commite senhas reais.

---

### Etapa 3 — Compilar todos os módulos

Na raiz do projeto:

```powershell
cd C:\Users\pedro\IdeaProjects\Projeto-Integrador-ADS-2026-1
mvn clean compile -am
```

Saída esperada:
```
[INFO] BUILD SUCCESS
[INFO] elden-care ... SUCCESS
[INFO] plataforma ... SUCCESS
```

---

### Etapa 4 — Subir o backend

```powershell
mvn spring-boot:run -pl backend/plataforma
```

O Spring Boot sobe na porta **8080** e carrega todos os módulos (incluindo elden-care) no mesmo classpath.

Logs esperados na inicialização:
```
[DataSeeder] Semeando 40 perguntas…
[DataSeeder] Seed de perguntas concluído.
[DataSeeder] Exercício criado: Caminhada ao ar livre
...
Started PlataformaApplication in X.XXX seconds
```

> Na **segunda execução** e seguintes, o DataSeeder detecta que os dados já existem e pula o seed:
> ```
> [DataSeeder] Perguntas já existem — seed ignorado.
> ```

---

### Etapa 5 — Verificar se o módulo está no ar

Primeiro faça login para obter o token:

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "seu@email.com",
  "password": "sua_senha"
}
```

Depois teste o ping:

```http
GET http://localhost:8080/api/elden-care/ping
Authorization: Bearer <token_aqui>
```

Resposta esperada:
```json
{ "ok": true, "service": "elden-care", "ts": "2026-05-29T14:00:00.000Z" }
```

---

### Etapa 6 — (Opcional) Subir o frontend

```powershell
cd C:\Users\pedro\IdeaProjects\Projeto-Integrador-ADS-2026-1\frontend
npm install
npm run dev
```

Acesse: `http://localhost:5173`

---

### Solução de problemas comuns

| Problema | Causa provável | Solução |
|---|---|---|
| `Connection refused` ao subir | PostgreSQL não está rodando | Inicie o serviço PostgreSQL |
| `password authentication failed` | Senha errada no `application.properties` | Corrija as credenciais |
| `schema elden_care does not exist` | `init-schemas.sql` não executou | Verifique `spring.sql.init.mode=always` no `application.properties` |
| `Could not find artifact plataforma` | Compilou só o módulo sem `-am` | Use `mvn compile -pl backend/modules/elden-care -am` |
| `401 Unauthorized` nos endpoints | Token ausente ou expirado | Refaça login e use o novo token |
| `400 Bad Request` no `/gerar` | `participanteId` ausente ou inválido | Verifique se o participante foi criado e o UUID está correto |

---

## 7. Histórico de Desenvolvimento

### Semestre 2025/2 — Herança

O grupo assumiu o projeto com as seguintes condições herdadas:

- Repositório base: `https://github.com/projeto-integrador-puc-ads/Projeto-Integrador`
- Backend Spring Boot 3 modular com autenticação JWT básica
- Frontend React + TypeScript com **autenticação mock** (token fixo `'demo-token'`)
- Token JWT armazenado apenas em memória (perdido ao recarregar a página)
- PostgreSQL no Docker com conflito de porta (5432 × instalação local)
- Ausência de documentação técnica atualizada

### Semestre 2026/1 — Desenvolvimento da equipe

#### Commit 29/04/2026 — Integração e correções base
- `LoginForm.tsx`: substituição do mock por chamada real ao `POST /api/auth/login`
- `http.ts`: persistência do JWT no `localStorage`
- `QuestionarioDemo.tsx`: adição do header `Authorization: Bearer` nas requisições
- `CriarIdosoDTO.java`: campo `telefone` tornado opcional
- `docker-compose.yml`: porta remapeada para `5433:5432`

#### Commit 30/04/2026 — Segurança, persistência e PDF
- BCrypt implementado para hash de senhas (cadastro + autenticação)
- Persistência das respostas individuais em `ex_resposta_usuario`
- Geração de PDF do plano com `jsPDF + jspdf-autotable`
- Redesign mobile-first do fluxo de cadastro e questionário

#### Commit 30/04/2026 — Migração do questionário para o banco
- `DataSeeder.java`: seed automático de 40 perguntas e 5 exercícios no startup
- `PerguntaService` / `PerguntaRepository` / `OpcaoPerguntaRepository`
- `GET /api/eldercare/questionario/perguntas` — frontend carrega questionário da API
- Remoção de dados hardcoded do frontend

#### 29/05/2026 — Migração para o Projeto-Integrador
- **Repositório destino:** `Projeto-Integrador-ADS-2026-1`, branch `develop`
- **Módulo:** `backend/modules/elden-care`
- Todos os arquivos migrados com o pacote correto: `br.pucgo.ads.projetointegrador.eldencare`
- `@Table(schema = "elden_care")` adicionado em todas as entidades
- Removido: sistema de autenticação local (`SecurityConfig`, `JwtAuthFilter`, `AuthController`, `Usuario`)
- Removido: entidade `Idoso` — substituída por `ex_participante` (já existente no domínio)
- `QuestionarioService`: payload alterado — aceita `participanteId` (UUID) em vez de `idosoId` (Long)
- Rotas: `/api/eldercare/` → `/api/elden-care/`
- `pom.xml`: adicionado `spring-boot-maven-plugin` com `<skip>true</skip>`
- Compilação limpa: **BUILD SUCCESS — 39 arquivos, 0 erros**

---

## 8. Pendências

### Integração com o frontend do Projeto-Integrador

O frontend do Projeto-Integrador ainda não tem as telas do módulo Elden Care integradas. As telas existem no repositório `elder_care` (branch `Eldercare`) e precisam ser portadas/adaptadas para o frontend em `Projeto-Integrador-ADS-2026-1/frontend/`.

Principais ajustes necessários no frontend:

| Item | Descrição |
|---|---|
| Rota da API | `/api/eldercare/` → `/api/elden-care/` |
| Payload do questionário | `idosoId` (Long) → `participanteId` (UUID) |
| Criação do participante | Usar `POST /api/elden-care/participantes` antes de enviar o questionário |
| Autenticação | Já estava funcionando — mantido o mesmo padrão JWT |

### Outras pendências do módulo

- [ ] Substituição dos dados mock nas páginas de administração
- [ ] Testes de integração para os endpoints críticos
- [ ] Implementação de guarda de rotas no frontend por role
- [ ] Melhorias de acessibilidade (fontes, contraste, alvos de toque) conforme RHIC

### Itens já concluídos

- ✅ Persistência das respostas no banco (`ex_resposta_usuario`)
- ✅ Segurança de senhas com BCrypt
- ✅ Geração de PDF do plano
- ✅ Perguntas e exercícios carregados da API (sem hardcode no frontend)
- ✅ Redesign mobile-first
- ✅ Migração para o Projeto-Integrador com schema isolado

---

*Goiânia, 29 de maio de 2026 — Pedro Willian Moraes Lourenço · Tarcísio Antônio dos Santos Filho*
