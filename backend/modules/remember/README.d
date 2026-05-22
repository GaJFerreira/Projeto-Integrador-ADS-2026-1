# Modulo: Remember

Este submodulo e dedicado exclusivamente as regras de negocio do Remember.

## Base URL

Todos os endpoints do modulo seguem o prefixo:

`/api/remember`

Principais recursos:

- `/api/remember/diarios`
- `/api/remember/lembrancas`
- `/api/remember/conquistas`
- `/api/remember/usuario-conquistas`
- `/api/remember/perguntas-cognitivas`
- `/api/remember/pergunta-templates`
- `/api/remember/respostas-perguntas-usuarios`

## O que deve conter aqui?

Para manter a organizacao e evitar o vazamento de codigo entre grupos, todo o desenvolvimento deve ocorrer dentro do pacote:

`br.pucgo.ads.projetointegrador.remember`

### Estrutura de pastas interna

- `controller/`: Endpoints da API (ex: `/api/remember/...`).
- `service/`: Logica de negocio e validacoes.
- `repository/`: Interfaces de consulta ao banco de dados (Spring Data JPA).
- `entity/`: Tabelas especificas deste dominio.
- `dto/`: Objetos de transferencia de dados para o frontend.
- `utils/`: Utilidades internas do modulo, sem dependencia direta da plataforma.

## Integracao com a plataforma

Este modulo deve permanecer independente da plataforma. Para proteger uma rota ou recuperar o usuario logado:

1. **Protecao de rota:** Use `@PreAuthorize("hasRole('ROLE_NAME')")` ou `@PreAuthorize("isAuthenticated()")` nos metodos do controller quando necessario.
2. **Usuario atual:** Extraia o `userId` do header `Authorization` com a utilidade local `JwtClaimsUtils`, mantendo apenas a referencia numerica ao usuario da plataforma.

## O que nao fazer

- Nao altere arquivos dentro da pasta `plataforma/`.
- Nao importe classes da plataforma. Se precisar referenciar o usuario autenticado, use apenas o ID numerico do token.
- Nao crie configuracoes de banco de dados locais. Use as da plataforma.
