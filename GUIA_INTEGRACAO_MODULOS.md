# Guia de Integração de Módulos

> Em construção...

Este documento define o padrão para acoplar novos módulos ao projeto sem quebrar a aplicação central (`plataforma`).

## 1) Princípio de arquitetura

- A aplicação executável do backend é **somente** `plataforma`.
- Cada novo módulo é uma **biblioteca interna** (JAR comum), sem classe `main`.
- O módulo pode ter controllers, services, repositories e entities próprios.
- Todos os módulos compartilham o mesmo banco físico, preferencialmente com separação lógica por schema.

## 2) Estrutura mínima do novo módulo

Crie o módulo em:

- `backend/modules/<nome-modulo>`

Pacotes recomendados:

- `controller`
- `service`
- `database/entity`
- `database/repository`
- `config` (apenas se estritamente necessário)
- `docs` (README, Postman, scripts)

## 3) Regras obrigatórias de configuração

### 3.1 `pom.xml` do novo módulo

- `packaging` deve ser `jar`.
- O módulo **não** deve ter classe principal `@SpringBootApplication`.
- Se existir `spring-boot-maven-plugin`, desative o repackage:

```xml
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
  <configuration>
    <skip>true</skip>
  </configuration>
</plugin>
```

> Sem isso, o build falha com `Unable to find main class`.

### 3.2 `pom.xml` raiz

- Adicione o módulo em `<modules>`.
- Liste o módulo **antes** de `backend/plataforma` (ordem de build).

### 3.3 `backend/plataforma/pom.xml`

- Adicione dependência do novo módulo para que ele entre no classpath da aplicação executável.

## 4) Registro no Spring da aplicação central

No `ProjetointegradorApplication` da `plataforma`, incluir o pacote do novo módulo em:

- `scanBasePackages` (controllers/services/configs)
- `@EntityScan` (entities)
- `@EnableJpaRepositories` (repositories)

Se faltar qualquer um deles, podem ocorrer erros como:

- endpoint 404 (controller não carregado)
- `Not a managed type` (entity fora do scan)
- falhas de criação de repositório

## 5) Padrão de rotas (evitar conflitos)

- Não usar `server.servlet.context-path` dentro de módulo para forçar prefixo global.
- Definir prefixo por controller do módulo (ex.: `/api/<modulo>/...`).
- Evitar caminhos genéricos sem prefixo do domínio.

Exemplo:

- `/api/sabor-familia/receita/...`
- `/api/remember/lembretes/...`

## 6) Segurança

- Por padrão, os endpoints dos módulos devem ficar protegidos por JWT.
- Apenas rotas explícitas devem ser públicas (ex.: `auth`, documentação, healthcheck se necessário).
- Se o módulo exigir permissões específicas, documentar claims/roles necessárias.

## 7) Banco de dados e ownership

- Preferir schema por módulo (`mod_<nome>` ou padrão acordado).
- Definir owner/role com permissões mínimas necessárias.
- Versionar migrações por módulo (Flyway/Liquibase), evitando scripts soltos sem controle.

## 8) Checklist de validação antes do merge

- [ ] O módulo compila no reactor Maven.
- [ ] `plataforma` sobe sozinha e carrega o novo módulo.
- [ ] Endpoints do módulo respondem com URL padronizada.
- [ ] Endpoint protegido retorna 401 sem token e sucesso com token válido.
- [ ] Não há erro de JPA (`Not a managed type`) no startup.
- [ ] README do módulo atualizado com base URL, endpoints e pré-requisitos.
- [ ] Coleção Postman do módulo disponível em `docs/postman`.

## 9) Anti-padrões (não fazer)

- Criar um `@SpringBootApplication` para cada módulo dentro do mesmo runtime.
- Colocar contexto global da aplicação em `application.yaml` de um módulo.
- Acoplar módulo diretamente em classes internas de outro módulo sem contrato claro.
- Subir mudanças sem checklist mínimo de startup + autenticação + endpoint.

---

Em caso de dúvida, use o fluxo de integração do módulo `sabor-familia` como referência inicial e preserve este padrão para os próximos módulos.
