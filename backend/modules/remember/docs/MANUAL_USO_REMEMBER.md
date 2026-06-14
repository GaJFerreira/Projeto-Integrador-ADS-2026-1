# Manual de Uso do Modulo Remember

## 1. Objetivo do Modulo

O Remember e um modulo voltado ao estimulo cognitivo e ao registro de memorias do usuario. Ele permite que o idoso registre diarios, cadastre lembrancas importantes, responda perguntas cognitivas e acompanhe conquistas desbloqueadas conforme utiliza o modulo.

O modulo foi desenvolvido para apoiar a rotina de cuidado, estimular a escrita, preservar historias pessoais e oferecer acompanhamento visual do progresso por meio de conquistas e ranking.

## 2. Perfis de Usuario

O modulo possui dois fluxos principais de uso:

| Perfil | O que pode fazer |
| --- | --- |
| Idoso ou usuario comum | Criar diarios, criar lembrancas, responder perguntas cognitivas e visualizar conquistas. |
| Administrador ou cuidador | Alem das acoes do usuario comum, pode cadastrar, editar e remover conquistas. |

O botao **Cadastrar Conquistas** aparece somente para usuarios com permissao de administrador ou cuidador.

## 3. Acesso ao Modulo

1. Faca login na plataforma.
2. Acesse o modulo **Remember** pela rota `/remember` ou pelo menu principal da plataforma.
3. Ao abrir o modulo, a tela exibira o titulo **Meu Diario Cognitivo**.
4. O usuario deve estar autenticado. Caso o sistema nao consiga identificar o usuario logado, sera exibida uma mensagem solicitando novo login.

## 4. Tela Principal do Remember

Na tela principal existem quatro abas:

| Aba | Funcao |
| --- | --- |
| Meus Diarios | Lista os registros de diario do usuario. |
| Minhas Lembrancas | Lista as lembrancas cadastradas pelo usuario. |
| Perguntas | Lista perguntas cognitivas pendentes ou respondidas. |
| Minhas Conquistas | Mostra as conquistas disponiveis, conquistas concluidas e ranking. |

Tambem existe o botao **Novo Registro**, usado para criar diarios ou lembrancas.

## 5. Como Criar um Diario

1. Acesse `/remember`.
2. Clique em **Novo Registro**.
3. Selecione **Escrever Diario**.
4. Preencha o campo **Titulo**.
5. Preencha o campo de conteudo com o relato do dia.
6. Clique em **Salvar Diario**.
7. O diario sera listado na aba **Meus Diarios**.

Ao salvar um diario com sucesso, o sistema verifica automaticamente se alguma conquista relacionada a diario foi concluida. Caso uma conquista seja desbloqueada, uma notificacao/modal aparece na tela.

## 6. Como Editar um Diario

1. Acesse a aba **Meus Diarios**.
2. Clique no card do diario desejado.
3. Edite o titulo ou o conteudo.
4. Clique em **Salvar Diario**.
5. A lista sera atualizada com as novas informacoes.

## 7. Como Excluir um Diario

1. Acesse a aba **Meus Diarios**.
2. Localize o diario desejado.
3. Clique no icone de lixeira no card.
4. Confirme a exclusao, se solicitado.
5. O diario sera removido da lista.

## 8. Como Criar uma Lembranca

1. Acesse `/remember`.
2. Clique em **Novo Registro**.
3. Selecione **Criar Lembranca**.
4. Preencha o titulo da lembranca.
5. Informe a data em que a lembranca aconteceu.
6. Informe o local, se houver.
7. Informe as pessoas presentes, se houver.
8. Escreva a historia da lembranca.
9. Se desejar, selecione uma imagem.
10. Clique em **Salvar Lembranca**.

Ao salvar uma lembranca com sucesso, o sistema verifica automaticamente se alguma conquista relacionada a lembrancas foi concluida. Caso uma conquista seja desbloqueada, uma notificacao/modal aparece na tela.

## 9. Como Editar uma Lembranca

1. Acesse a aba **Minhas Lembrancas**.
2. Clique no card da lembranca desejada.
3. Edite os campos necessarios.
4. Clique em **Salvar Lembranca**.
5. A lista sera atualizada.

## 10. Como Excluir uma Lembranca

1. Acesse a aba **Minhas Lembrancas**.
2. Localize a lembranca desejada.
3. Clique no icone de lixeira no card.
4. Confirme a exclusao, se solicitado.
5. A lembranca sera removida da lista.

## 11. Como Usar as Perguntas Cognitivas

1. Acesse a aba **Perguntas**.
2. O sistema exibira as perguntas cognitivas do usuario.
3. Use os filtros disponiveis para visualizar perguntas pendentes ou respondidas.
4. Para responder uma pergunta pendente, clique em **Responder**.
5. Digite a resposta no campo exibido.
6. Clique em **Salvar Resposta**.

Ao responder uma pergunta cognitiva, o sistema verifica automaticamente conquistas relacionadas a respostas. Caso uma conquista seja desbloqueada, uma notificacao/modal aparece na tela.

## 12. Como Visualizar Conquistas

1. Acesse a aba **Minhas Conquistas**.
2. O sistema exibira as conquistas disponiveis para o usuario.
3. Conquistas ainda nao concluidas aparecem como pendentes.
4. Conquistas concluidas aparecem com status de concluida e data de obtencao.
5. A tela tambem apresenta informacoes de pontuacao e ranking geral.

Quando uma conquista e concluida durante o uso do modulo, o usuario recebe uma confirmacao visual na tela.

## 13. Como Cadastrar Conquistas

Este fluxo e exclusivo para administradores e cuidadores.

1. Acesse `/remember` com um usuario administrador ou cuidador.
2. Clique em **Cadastrar Conquistas**.
3. Na tela de conquistas, clique em **Nova Conquista**.
4. Selecione uma imagem para ser o icone da conquista.
5. Preencha o **Nome da Conquista**.
6. Preencha a **Descricao**.
7. Informe a **Pontuacao**.
8. Informe a **Meta**.
9. Escolha o **Tipo (Gatilho)**.
10. Clique em **Criar Conquista**.

Se algum campo obrigatorio nao for preenchido, se a pontuacao ou meta forem invalidas, ou se o icone nao for selecionado, o sistema exibe uma mensagem visual explicando o erro.

## 14. Tipos de Gatilho de Conquistas

As conquistas podem ser cadastradas com os seguintes gatilhos:

| Codigo | Gatilho | Quando pode ser concluida |
| --- | --- | --- |
| 1 | Diario | Quando o usuario cria a quantidade de diarios definida na meta. |
| 2 | Lembranca | Quando o usuario cria a quantidade de lembrancas definida na meta. |
| 3 | Dias Consecutivos | Quando o usuario registra diarios em dias consecutivos conforme a meta. |
| 4 | Meses Ativos | Quando o usuario mantem atividade por meses conforme a meta. |
| 5 | Perguntas Cognitivas Respondidas | Quando o usuario responde a quantidade de perguntas definida na meta. |

Exemplo: para criar uma conquista chamada "Primeiro Diario", selecione o tipo **1 - Diario** e defina a meta como **1**. Assim, quando o usuario criar o primeiro diario, a conquista sera desbloqueada.

## 15. Como Editar Conquistas

1. Acesse `/admin/conquistas` com usuario administrador ou cuidador.
2. Localize a conquista desejada.
3. Clique na acao de edicao.
4. Altere o nome ou a descricao.
5. Salve as alteracoes.

## 16. Como Remover Conquistas

1. Acesse `/admin/conquistas` com usuario administrador ou cuidador.
2. Localize a conquista desejada.
3. Clique na acao de remocao.
4. Confirme a exclusao.
5. A conquista sera removida da listagem.

## 17. Confirmacoes Visuais e Tratamento de Erros

O modulo exibe mensagens visuais para orientar o usuario quando uma acao falha ou e concluida. Exemplos:

| Situacao | Feedback esperado |
| --- | --- |
| Diario salvo com sucesso | Lista atualizada e possivel notificacao de conquista. |
| Lembranca salva com sucesso | Lista atualizada e possivel notificacao de conquista. |
| Pergunta respondida com sucesso | Status atualizado e possivel notificacao de conquista. |
| Campos obrigatorios vazios | Mensagem visual informando que os campos devem ser preenchidos. |
| Meta ou pontuacao invalida | Mensagem visual informando que os valores devem ser maiores que zero. |
| Imagem de conquista ausente | Mensagem visual informando que o icone e obrigatorio. |
| Erro de comunicacao com API | Mensagem visual informando que ocorreu erro na operacao. |

## 18. Observacao Sobre Audio

A funcao de audio/transcricao foi removida temporariamente do modulo Remember ate que seja possivel garantir o funcionamento correto e estavel. No estado atual da entrega, os campos de diario, lembranca e resposta cognitiva devem ser preenchidos manualmente.

## 19. Roteiro Sugerido para Demonstracao aos Professores

1. Entrar na plataforma com um usuario comum.
2. Acessar o modulo Remember.
3. Criar um diario.
4. Mostrar o diario criado na aba **Meus Diarios**.
5. Criar uma lembranca.
6. Mostrar a lembranca criada na aba **Minhas Lembrancas**.
7. Acessar a aba **Perguntas** e responder uma pergunta cognitiva, caso exista pergunta pendente.
8. Acessar a aba **Minhas Conquistas** e mostrar o progresso do usuario.
9. Entrar com usuario administrador ou cuidador.
10. Mostrar o botao **Cadastrar Conquistas**.
11. Cadastrar uma nova conquista com gatilho de diario, lembranca ou perguntas.
12. Demonstrar que um usuario sem permissao de administrador/cuidador nao visualiza o botao de cadastro de conquistas.

## 20. Checklist de Entrega

Use este checklist antes da apresentacao:

- [ ] Login realizado com sucesso.
- [ ] Rota `/remember` acessivel.
- [ ] Aba **Meus Diarios** carregando corretamente.
- [ ] Criacao de diario funcionando.
- [ ] Edicao de diario funcionando.
- [ ] Exclusao de diario funcionando.
- [ ] Aba **Minhas Lembrancas** carregando corretamente.
- [ ] Criacao de lembranca funcionando.
- [ ] Edicao de lembranca funcionando.
- [ ] Exclusao de lembranca funcionando.
- [ ] Aba **Perguntas** carregando corretamente.
- [ ] Resposta de pergunta cognitiva funcionando.
- [ ] Aba **Minhas Conquistas** carregando conquistas e ranking.
- [ ] Conquista desbloqueada exibindo notificacao/modal.
- [ ] Usuario administrador/cuidador visualizando **Cadastrar Conquistas**.
- [ ] Usuario comum sem acesso ao cadastro de conquistas.
- [ ] Validacoes de erro exibindo mensagem visual para o usuario.

## 21. Rotas e Endpoints Principais

### Frontend

| Rota | Funcao |
| --- | --- |
| `/remember` | Tela principal do modulo Remember. |
| `/admin/conquistas` | Listagem administrativa de conquistas. |
| `/admin/conquistas/novo` | Cadastro de nova conquista. |
| `/admin/conquistas/:id/edit` | Edicao de conquista existente. |

### Backend

| Endpoint | Funcao |
| --- | --- |
| `/api/remember/diarios` | Criacao, edicao, consulta e remocao de diarios. |
| `/api/remember/lembrancas` | Criacao, edicao, consulta e remocao de lembrancas. |
| `/api/remember/conquistas` | Cadastro, edicao, consulta e remocao de conquistas. |
| `/api/remember/usuario-conquistas` | Consulta de conquistas do usuario e ranking. |
| `/api/remember/perguntas-cognitivas` | Geracao e listagem de perguntas cognitivas. |
| `/api/remember/respostas-perguntas` | Registro e consulta de respostas cognitivas. |

## 22. Resultado Esperado

Ao final do uso, o modulo deve permitir que o usuario registre experiencias pessoais, acompanhe seu progresso cognitivo por meio de conquistas e receba feedback visual sempre que uma acao importante ocorrer ou quando algum erro impedir a conclusao da operacao.
