# Módulo: CareHub

Este submódulo é dedicado exclusivamente às regras de negócio do grupo **CeraRub**.

## 📦 O que deve conter aqui?
Para manter a organização e evitar o "vazamento" de código entre grupos, todo o desenvolvimento deve ocorrer dentro do pacote:
`br.pucgo.ads.projetointegrador.carehub`

### Estrutura de Pastas Interna:
- `controller/`: Endpoints da API (ex: `/api/carehub/...`).
- `service/`: Lógica de negócio e validações.
- `repository/`: Interfaces de consulta ao banco de dados (Spring Data JPA).
- `entity/`: Tabelas específicas deste domínio.
- `dto/`: Objetos de transferência de dados para o Frontend.

## 🔑 Integração com a Plataforma
Este módulo herda as dependências da Plataforma. Para proteger uma rota ou recuperar o usuário logado:

1. **Proteção de Rota:** Use `@PreAuthorize("hasRole('ROLE_NAME')")` nos métodos do seu Controller.
2. **Usuário Atual:** Utilize o `SecurityContextHolder` para obter o e-mail ou ID do usuário que está realizando a requisição, garantindo que um paciente não veja dados de outro.

## 🚫 O que NÃO fazer
- Não altere arquivos dentro da pasta `plataforma/`.
- Não duplique a classe `User`. Se precisar de dados do usuário, use a entidade da Plataforma.
- Não crie configurações de banco de dados locais. Use as da Plataforma.