# 📘 Guia de Versionamento e Colaboração
Projeto Integrador ADS 2026-1

## 1. Contextualização da Arquitetura

O projeto adota uma estrutura de Monorepo com as seguintes características:

- **Backend Modular**: Estruturado em uma relação Pai-Filho. A plataforma centraliza as configurações core (Segurança, JWT, Usuários), enquanto cada Módulo (ex: Sabor da Família, Dose Certa) é independente, mas herda as definições da plataforma via Maven.

- **Frontend Unificado**: Uma única aplicação React que atende a todos os módulos, segregada internamente por diretórios de funcionalidades (features).

## 2. Regras de Escopo e Responsabilidade

Para evitar conflitos e instabilidades, a divisão de trabalho é estritamente baseada em diretórios:

 1. **Isolamento**: Cada grupo tem permissão para editar apenas a sua respectiva pasta de módulo no backend e suas pastas de funcionalidades no frontend.

 2. **Alterações na Plataforma**: É terminantemente proibido editar arquivos dentro de backend/plataforma sem autorização. Caso o seu módulo necessite de uma nova permissão, alteração no banco core ou nova rota de segurança, a solicitação deve ser enviada formalmente ao Grupo da Plataforma.

 3. **Consequência**: Qualquer commit que contenha alterações em arquivos fora do escopo do grupo será automaticamente recusado.

## 3. Padrão de Branchs e Commits

Seguimos o padrão de Conventional Commits para manter o histórico legível.

### 3.1. Nomenclatura de Branchs

As branchs devem ser criadas a partir da `develop` seguindo o formato:
`tipo/descricao-curta`

Tipos permitidos:

- `feature/`: Nova funcionalidade ou módulo.

- `fix/`: Correção de bugs.

- `chore/`: Atualização de dependências ou tarefas administrativas.

- `docs/`: Alterações apenas em documentação.

- `refactor/`: Mudança no código que não altera comportamento.

**Exemplo**: `feature/cadastro-receitas` ou `fix/erro-login-jwt`

### 3.2. Mensagens de Commit

As mensagens devem ser em português, claras e diretas.
`tipo: descrição curta em letras minúsculas`

**Exemplo**: `feat: implementa listagem de ingredientes`

## 4. Fluxo de Pull Request (PR)

```
### 📝 Descrição das Alterações
- [Breve resumo do que foi feito]
- Adição da entidade X no banco de dados.
- Implementação do Controller Y para o módulo Z.
- Ajuste de estilo no componente de listagem (Frontend).

### 🛠 Arquivos Modificados
- `backend/seu-modulo/...`
- `frontend/src/features/sua-feature/...`

### ✅ Checklist de Validação
- [ ] O código compila sem erros localmente.
- [ ] Não foram alterados arquivos da pasta `plataforma`.
- [ ] O padrão de nomenclatura de commits foi seguido.
```
## 5. Governança e Automatização

Para garantir o fluxo de trabalho, o repositório seguirá as seguintes automações e regras de revisão:

- **Recusa Automática**: Pull Requests com nomes de branch fora do padrão, mensagens de commit confusas ou edições em pastas não autorizadas serão fechados sem revisão.

- **Gestão de Branchs**: Após a aprovação e o Merge na branch principal (`develop`), a branch de origem será automaticamente excluída para manter o repositório limpo.

- **Solicitação de Mudança Core**: Se você precisa de algo na plataforma:

  1. Abra uma Issue descrevendo a necessidade.

  2. Aguarde a implementação/autorização do grupo responsável.


---

**Nota Final**: A disciplina no versionamento é o que permitirá que múltiplos grupos trabalhem no mesmo código sem gerar o "caos de integração". Respeite o espaço do colega e o núcleo do sistema
