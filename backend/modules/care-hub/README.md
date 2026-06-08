# CareHub - README do Modulo Backend

Este documento explica, de forma geral e simples, como funciona o modulo **CareHub** no backend do projeto.

O CareHub e um modulo voltado para cuidado assistencial. Ele conecta **clientes** ou **idosos/familiares** com **cuidadores**, permitindo cadastro de perfil, busca de cuidadores, agendamento de atendimentos, chat, prontuario, registros de acompanhamento, avaliacoes e alertas de emergencia via dispositivo IoT.

## Localizacao no projeto

O modulo fica em:

```text
backend/modules/care-hub
```

Pacote Java principal:

```text
br.pucgo.ads.projetointegrador.carehub
```

Estrutura principal:

```text
controller/   Rotas da API REST
service/      Regras de negocio
repository/   Acesso ao banco com Spring Data JPA
entity/       Entidades/tabelas do dominio CareHub
dto/          Objetos de entrada e saida da API
exception/    Tratamento de erros do modulo
```

## Como o modulo se integra com a plataforma

O CareHub usa a autenticacao da plataforma principal. Quando o usuario acessa rotas como `/api/carehub/perfil`, o modulo le o usuario autenticado no contexto de seguranca e sincroniza esse usuario para uma tabela local do CareHub.

Essa sincronizacao e feita por `UsuarioSyncService`.

Na pratica:

- Se a role da plataforma indicar cuidador, o usuario vira um `Cuidador` local.
- Caso contrario, o usuario vira um `Cliente` local.
- Se a role contiver `IDOSO`, o cliente recebe `tipoCliente = IDOSO`.
- O modulo guarda o `platformUserId` para ligar o usuario da plataforma ao usuario local do CareHub.

Isso evita duplicar toda a autenticacao dentro do CareHub, mas permite que o modulo tenha dados especificos do seu dominio.

## Principais entidades

### Cliente

Representa a pessoa que recebe o cuidado ou solicita atendimento.

Campos importantes:

- `platformUserId`: id do usuario na plataforma principal.
- `username`, `email`, `name`: dados basicos vindos da plataforma.
- `telefone`, `endereco`, `necessidades`, `contatoEmergencia`.
- `tipoCliente`: pode indicar cliente comum, idoso etc.
- `ativo`, `status`, `deletedAt`: controle de status e exclusao logica.

Tabela: `care_hub.ch_cliente`

### Cuidador

Representa o profissional/cuidador que presta atendimento.

Campos importantes:

- `platformUserId`: id do usuario na plataforma principal.
- `username`, `email`, `name`.
- `telefone`, `experiencia`, `cidade`, `estado`.
- `especialidades`: lista ligada a tabela de especialidades.
- `disponibilidade`, `taxaHora`, `avaliacaoMedia`, `totalAvaliacoes`.
- `biografia`, `fotoPerfil`.
- `ativo`, `status`, `deletedAt`.

Tabela: `care_hub.ch_cuidador`

### Especialidade

Representa especialidades do cuidador, como atendimento domiciliar, enfermagem, acompanhamento etc.

Tabela: `care_hub.ch_especialidade`

Relacao com cuidador:

```text
care_hub.ch_cuidador_especialidade
```

### Agendamento

Representa um atendimento marcado entre cliente e cuidador.

Campos importantes:

- `cliente`
- `cuidador`
- `dataHoraInicio`
- `dataHoraFim`
- `status`
- `tipoAtendimento`
- `observacoes`
- `dataSolicitacao`
- `proposedDataHoraInicio` e `proposedDataHoraFim`, usados em contrapropostas.

Tabela: `care_hub.ch_agendamento`

Status possiveis:

- `PENDENTE`: criado e aguardando resposta do cuidador.
- `CONFIRMADO`: aceito e confirmado.
- `REAGENDADO`: cuidador sugeriu nova data/horario.
- `EM_ANDAMENTO`: atendimento iniciado.
- `CONCLUIDO`: atendimento finalizado.
- `CANCELADO`: atendimento cancelado.

Tipos de atendimento:

- `DOMICILIO`: atendimento na residencia do cliente.
- `ACOMPANHAMENTO`: acompanhamento regular.
- `PRESENCIAL`: atendimento presencial em clinica/hospital.
- `EMERGENCIA`: atendimento emergencial.

### Prontuario

Guarda informacoes de saude do cliente.

Campos importantes:

- `cliente`
- `dataNascimento`
- `historicoMedico`
- `medicamentosUso`
- `alergias`
- `contatoEmergencia`
- `observacoesGerais`
- `tipoSanguineo`
- `necessidadesEspeciais`

Tabela: `care_hub.ch_prontuario`

Regra importante: o cuidador so pode editar o prontuario durante atendimentos agendados para o dia atual.

### Registro de acompanhamento

Representa o registro feito pelo cuidador durante ou apos um atendimento.

Campos importantes:

- `agendamento`
- `cuidador`
- `cliente`
- `dataHoraRegistro`
- `pressaoArterial`
- `glicemia`
- `medicamentosAdministrados`
- `alimentacao`
- `atividadesRealizadas`
- `observacoes`
- `intercorrencias`
- `sinaisVitais`
- `humorEstado`

Tabela: `care_hub.ch_registro_acompanhamento`

Quando o cuidador inicia um atendimento, o sistema cria automaticamente um registro inicial, caso ainda nao exista.

### Mensagem

Representa o chat entre cliente e cuidador.

Campos importantes:

- `remetenteId`
- `destinatarioId`
- `conteudo`
- `mediaUrl`
- `mediaType`
- `dataEnvio`
- `lida`

Tabela: `care_hub.ch_mensagem`

O chat permite texto e midia. A midia fica salva na entidade `MessageMedia`.

### MessageMedia

Guarda arquivos enviados pelo chat, como imagem ou audio.

Campos importantes:

- `mensagemId`
- `storageKey`
- `mediaUrl`
- `contentType`
- `sizeBytes`
- `data`
- `createdAt`

Tabela: `care_hub.message_media`

Existe uma limpeza automatica diaria que remove midias com mais de 7 dias.

### Avaliacao

Representa a avaliacao feita pelo cliente sobre um cuidador apos um atendimento.

Campos importantes:

- `cuidador`
- `cliente`
- `agendamento`
- `nota`
- `comentario`
- `dataAvaliacao`

Tabela: `care_hub.ch_avaliacao`

Regras principais:

- Apenas o cliente do agendamento pode avaliar.
- O cuidador informado precisa ser o cuidador do agendamento.
- O agendamento precisa estar `CONCLUIDO`.
- A nota vai de 1 a 5.
- A media e o total de avaliacoes do cuidador sao atualizados.

### DispositivoIoT

Representa um dispositivo fisico de emergencia vinculado a um cliente.

Campos importantes:

- `deviceId`: identificador publico do dispositivo.
- `cliente`: cliente dono do dispositivo.
- `nome`: nome amigavel, como "Botao de Emergencia".
- `apiKeyHash`: chave do dispositivo salva com hash.
- `ativo`
- `ultimoIp`
- `ultimoBatimentoEm`

Tabela: `care_hub.ch_dispositivo_iot`

### AlertaEmergencia

Representa um alerta disparado por dispositivo IoT.

Campos importantes:

- `cliente`
- `cuidador`
- `dispositivo`
- `tipo`
- `status`
- `origem`
- `observacao`
- `criadoEm`
- `reconhecidoEm`

Tabela: `care_hub.ch_alerta_emergencia`

Status usado no fluxo atual:

- `PENDENTE`: alerta criado e ainda nao reconhecido.
- `RECONHECIDO`: alerta ja visto/tratado por alguem.

## Rotas da API

Todas as rotas principais usam o prefixo:

```text
/api/carehub
```

### Saude do modulo

| Metodo | Rota | O que faz |
|---|---|---|
| GET | `/api/carehub/health` | Retorna status simples do modulo, com `module`, `status` e `timestamp`. |

### Perfil do usuario logado

Controller: `CareHubPerfilController`

| Metodo | Rota | O que faz |
|---|---|---|
| GET | `/api/carehub/perfil` | Busca o perfil CareHub do usuario logado. Se necessario, sincroniza com a plataforma. |
| POST | `/api/carehub/perfil/completar` | Completa o perfil do usuario logado com dados especificos de cliente ou cuidador. |
| PUT | `/api/carehub/perfil` | Atualiza o perfil do usuario logado. |

Campos aceitos no perfil:

- Comuns: `name`, `email`, `phone`.
- Cliente: `endereco`, `necessidades`, `contatoEmergencia`, `tipoCliente`.
- Cuidador: `experiencia`, `cidade`, `estado`, `taxaHora`, `biografia`, `fotoPerfil`, `especialidades`.

### Cuidadores

Controller: `CuidadorController`

| Metodo | Rota | O que faz |
|---|---|---|
| GET | `/api/carehub/cuidadores` | Lista cuidadores ativos. |
| GET | `/api/carehub/cuidadores/buscar` | Busca cuidadores com filtros e paginacao. |
| GET | `/api/carehub/cuidadores/{id}` | Busca um cuidador por id local. |
| PUT | `/api/carehub/cuidadores/{id}` | Atualiza dados de um cuidador. Exige role `CUIDADOR`. |
| DELETE | `/api/carehub/cuidadores/{id}` | Remove logicamente um cuidador. Exige role `CUIDADOR`. |

Filtros de busca:

- `nome`
- `localizacao`
- `especialidade`
- `disponibilidade`
- `page`, padrao `0`
- `size`, padrao `10`
- `sortBy`, padrao `avaliacaoMedia`
- `direction`, padrao `DESC`

Ordenacoes permitidas:

- `avaliacaoMedia`
- `taxaHora`
- `nome` ou `name`
- `cidade`
- `estado`
- `createdAt` ou `criadoEm`

### Clientes

Controller: `ClienteController`

| Metodo | Rota | O que faz |
|---|---|---|
| GET | `/api/carehub/clientes` | Lista clientes ativos. Exige role `CUIDADOR`. |
| GET | `/api/carehub/clientes/{id}` | Busca um cliente por id local. |
| PUT | `/api/carehub/clientes/{id}` | Atualiza dados do cliente. |
| DELETE | `/api/carehub/clientes/{id}` | Remove logicamente um cliente. Exige role `CUIDADOR`. |

O controller aceita usuarios com role `IDOSO`, `FAMILIAR` ou `CUIDADOR`, mas algumas operacoes sao restritas a cuidador.

### Agendamentos

Controller: `AgendamentoController`

| Metodo | Rota | O que faz |
|---|---|---|
| POST | `/api/carehub/agendamentos` | Cria um novo agendamento entre cliente e cuidador. |
| PUT | `/api/carehub/agendamentos/{id}/status?status=...` | Atualiza o status do agendamento. |
| POST | `/api/carehub/agendamentos/{id}/contraproposta` | Cuidador propoe nova data/horario. |
| POST | `/api/carehub/agendamentos/{id}/aceitar-contraproposta` | Cliente aceita a contraproposta do cuidador. |
| GET | `/api/carehub/agendamentos/cuidador/{cuidadorId}` | Lista agendamentos de um cuidador. |
| GET | `/api/carehub/agendamentos/cliente/{clienteId}` | Lista agendamentos de um cliente. |
| GET | `/api/carehub/agendamentos/{id}` | Busca agendamento por id. |
| GET | `/api/carehub/agendamentos/cuidador/{cuidadorId}/periodo` | Lista agendamentos do cuidador em um periodo. |
| GET | `/api/carehub/agendamentos/proximos?dias=7` | Lista proximos agendamentos do usuario logado. |
| DELETE | `/api/carehub/agendamentos/{id}` | Cancela o agendamento. |
| GET | `/api/carehub/agendamentos/{id}/pode-iniciar` | Verifica se o atendimento pode ser iniciado. |
| GET | `/api/carehub/agendamentos/avaliacoes-pendentes` | Lista atendimentos concluidos que ainda precisam de avaliacao. |
| GET | `/api/carehub/agendamentos/avaliacoes-pendentes/count` | Conta avaliacoes pendentes do cliente logado. |
| GET | `/api/carehub/agendamentos/pendentes-cuidador/count` | Conta propostas pendentes para o cuidador logado. |
| GET | `/api/carehub/agendamentos/reagendados-cliente/count` | Conta contrapropostas aguardando resposta do cliente logado. |

Corpo usado para criar agendamento:

```json
{
  "cuidadorId": 10,
  "clienteId": 5,
  "dataHoraInicio": "2026-06-01T14:00:00Z",
  "dataHoraFim": "2026-06-01T16:00:00Z",
  "observacoes": "Acompanhamento vespertino",
  "tipoAtendimento": "ACOMPANHAMENTO"
}
```

Regras de status:

- O agendamento nasce como `PENDENTE`.
- O cuidador pode confirmar a proposta inicial, mudando para `CONFIRMADO`.
- O cuidador pode iniciar o atendimento, mudando para `EM_ANDAMENTO`.
- O atendimento so pode ser iniciado a partir de 30 minutos antes do horario inicial e ate o horario final.
- Ao iniciar atendimento, o sistema cria um registro de acompanhamento automatico se ainda nao existir.
- O cuidador pode concluir, mudando para `CONCLUIDO`.
- Cliente ou cuidador podem cancelar, mudando para `CANCELADO`.
- O status `REAGENDADO` nao deve ser colocado diretamente pelo endpoint de status; deve ser usado o endpoint de contraproposta.

Fluxo de contraproposta:

1. Cliente cria agendamento.
2. Cuidador nao aceita aquele horario e envia uma contraproposta.
3. Sistema salva `proposedDataHoraInicio` e `proposedDataHoraFim`.
4. Status vira `REAGENDADO`.
5. Cliente aceita a contraproposta.
6. Sistema move as datas propostas para as datas oficiais e muda status para `CONFIRMADO`.

### Prontuarios

Controller: `ProntuarioController`

| Metodo | Rota | O que faz |
|---|---|---|
| POST | `/api/carehub/prontuarios` | Cria prontuario de um cliente. |
| PUT | `/api/carehub/prontuarios/{id}` | Atualiza prontuario. |
| GET | `/api/carehub/prontuarios/{id}` | Busca prontuario por id. |
| GET | `/api/carehub/prontuarios/cliente/{clienteId}` | Busca prontuario pelo cliente. |
| GET | `/api/carehub/prontuarios/pode-editar/{clienteId}` | Verifica se o cuidador logado pode editar o prontuario daquele cliente. |

Corpo de criacao/edicao:

```json
{
  "clienteId": 5,
  "dataNascimento": "1950-04-10",
  "historicoMedico": "Hipertensao controlada",
  "medicamentosUso": "Losartana",
  "alergias": "Dipirona",
  "contatoEmergencia": "Maria - (62) 99999-9999",
  "observacoesGerais": "Precisa de acompanhamento para locomocao",
  "tipoSanguineo": "O+",
  "necessidadesEspeciais": "Uso de bengala"
}
```

Regra importante:

O cuidador so consegue editar prontuario se existir atendimento ativo/agendado para o dia entre ele e o cliente.

### Registros de acompanhamento

Controller: `RegistroAcompanhamentoController`

| Metodo | Rota | O que faz |
|---|---|---|
| POST | `/api/carehub/registros` | Cria um registro de acompanhamento para um agendamento. |
| GET | `/api/carehub/registros/cliente/{clienteId}` | Lista registros de um cliente. |
| GET | `/api/carehub/registros/cuidador/{cuidadorId}` | Lista registros de um cuidador. |
| GET | `/api/carehub/registros/agendamento/{agendamentoId}` | Lista registros de um agendamento. |
| GET | `/api/carehub/registros/{id}` | Busca registro por id. |

Corpo de criacao:

```json
{
  "agendamentoId": 22,
  "dataHoraRegistro": "2026-06-01T15:00:00Z",
  "pressaoArterial": "120/80",
  "glicemia": "95",
  "medicamentosAdministrados": "Losartana",
  "alimentacao": "Almoco completo",
  "atividadesRealizadas": "Caminhada leve",
  "observacoes": "Cliente bem disposto",
  "intercorrencias": "Sem intercorrencias",
  "sinaisVitais": "Estaveis",
  "humorEstado": "Calmo"
}
```

Regra principal:

O cuidador autenticado precisa ser o cuidador do agendamento informado.

### Mensagens e chat

Controller: `MensagemController`

| Metodo | Rota | O que faz |
|---|---|---|
| POST | `/api/carehub/mensagens` | Envia mensagem de texto. |
| GET | `/api/carehub/mensagens` | Lista mensagens do usuario logado. |
| GET | `/api/carehub/mensagens/conversa/{usuarioId}` | Lista conversa entre o usuario logado e outro usuario. |
| POST | `/api/carehub/mensagens/media` | Envia mensagem com arquivo de midia. |
| GET | `/api/carehub/mensagens/media/{filename}` | Baixa/exibe uma midia do chat. |
| GET | `/api/carehub/mensagens/nao-lidas` | Lista mensagens nao lidas do usuario logado. |
| PUT | `/api/carehub/mensagens/{id}/lida` | Marca uma mensagem como lida. |
| GET | `/api/carehub/mensagens/contador-nao-lidas` | Conta mensagens nao lidas. |
| GET | `/api/carehub/mensagens/contatos` | Lista contatos do chat com previa da ultima mensagem. |
| PUT | `/api/carehub/mensagens/marcar-lidas/{remetenteId}` | Marca uma conversa como lida. |
| GET | `/api/carehub/mensagens/chat-ativo/{usuarioId}` | Verifica se o chat com outro usuario esta ativo. |

Corpo para mensagem de texto:

```json
{
  "destinatarioId": 10,
  "conteudo": "Boa tarde, podemos confirmar o atendimento?"
}
```

Envio de midia:

```text
POST /api/carehub/mensagens/media
Content-Type: multipart/form-data

destinatarioId: id do destinatario
file: arquivo enviado
```

Regras importantes:

- O controller converte ids da plataforma para ids locais do CareHub quando necessario.
- O arquivo enviado fica salvo em `MessageMedia`.
- Ao buscar midia, apenas remetente ou destinatario da mensagem podem acessar.
- O chat e considerado ativo quando existe agendamento `PENDENTE`, `CONFIRMADO` ou `EM_ANDAMENTO` entre os usuarios.
- Midias antigas com mais de 7 dias sao apagadas automaticamente pelo `ScheduledCleanupService`.

### Avaliacoes

Controller: `AvaliacaoController`

| Metodo | Rota | O que faz |
|---|---|---|
| POST | `/api/carehub/avaliacoes` | Cliente cria avaliacao para cuidador apos atendimento concluido. |
| GET | `/api/carehub/avaliacoes/cuidador/{cuidadorId}` | Lista avaliacoes de um cuidador. |
| DELETE | `/api/carehub/avaliacoes/{id}` | Remove uma avaliacao. |

Corpo de criacao:

```json
{
  "cuidadorId": 10,
  "agendamentoId": 22,
  "nota": 5,
  "comentario": "Atendimento excelente"
}
```

Regras:

- A nota minima e 1.
- A nota maxima e 5.
- So e possivel avaliar agendamento `CONCLUIDO`.
- O cliente autenticado deve ser o cliente do agendamento.
- O cuidador informado deve ser o cuidador do agendamento.
- Apos salvar, o sistema recalcula a media do cuidador.

### Alertas e dispositivo IoT

Controller: `AlertaEmergenciaController`

| Metodo | Rota | O que faz |
|---|---|---|
| POST | `/api/carehub/iot/devices` | Cadastra um dispositivo IoT para o cliente logado. |
| GET | `/api/carehub/iot/devices` | Lista dispositivos do cliente logado. |
| POST | `/api/carehub/iot/alerts` | Recebe alerta enviado pelo dispositivo fisico. |
| GET | `/api/carehub/alertas` | Lista alertas do usuario logado. |
| PUT | `/api/carehub/alertas/{id}/reconhecer` | Marca um alerta como reconhecido. |

#### Cadastro do dispositivo

O cadastro deve ser feito por um usuario cliente.

Corpo:

```json
{
  "nome": "Botao de Emergencia do Quarto",
  "deviceId": "esp32-quarto-001",
  "deviceKey": "chave-secreta-do-dispositivo"
}
```

Observacoes:

- Se `deviceId` nao for enviado, o backend gera um id no formato `esp32-xxxxxxxx`.
- Se `deviceKey` nao for enviada, o backend gera uma chave aleatoria.
- A chave e devolvida em texto puro apenas no cadastro, no campo `deviceKeyPlain`.
- No banco, a chave fica salva como hash em `apiKeyHash`.

Resposta esperada:

```json
{
  "id": 1,
  "nome": "Botao de Emergencia do Quarto",
  "deviceId": "esp32-quarto-001",
  "ativo": true,
  "ultimoBatimentoEm": null,
  "deviceKeyPlain": "chave-secreta-do-dispositivo"
}
```

#### Como o dispositivo IoT envia alerta

O dispositivo fisico, como um ESP32, chama:

```text
POST /api/carehub/iot/alerts
```

Headers obrigatorios:

```text
X-Device-Id: esp32-quarto-001
X-Device-Key: chave-secreta-do-dispositivo
```

Corpo:

```json
{
  "tipo": "BOTAO_PANICO",
  "observacao": "Botao pressionado pelo cliente",
  "battery": 90,
  "signal": 80,
  "pressedAt": "2026-06-01T15:00:00Z"
}
```

Fluxo interno do alerta:

1. Backend valida se `X-Device-Id` e `X-Device-Key` foram enviados.
2. Busca o dispositivo pelo `deviceId`.
3. Verifica se o dispositivo esta ativo.
4. Compara a chave enviada com o hash salvo no banco.
5. Atualiza `ultimoIp` e `ultimoBatimentoEm` do dispositivo.
6. Cria um `AlertaEmergencia` com status `PENDENTE`.
7. Define a origem como `ESP32`.
8. Usa o tipo enviado ou `BOTAO_PANICO` como padrao.
9. Tenta vincular o alerta ao cuidador ativo mais recente do cliente.
10. Retorna o alerta criado.

Se a credencial do dispositivo estiver errada, a API retorna erro de autorizacao.

#### Listagem de alertas

```text
GET /api/carehub/alertas
GET /api/carehub/alertas?status=PENDENTE
GET /api/carehub/alertas?status=RECONHECIDO
```

Comportamento:

- Cliente ve os alertas dos seus proprios dispositivos.
- Cuidador ve alertas vinculados a ele.
- O filtro `status` e opcional.

#### Reconhecer alerta

```text
PUT /api/carehub/alertas/{id}/reconhecer
```

Essa rota muda:

- `status` para `RECONHECIDO`
- `reconhecidoEm` para o horario atual

## Administracao

Controller: `AdminController`

Prefixo:

```text
/api/carehub/admin
```

Todas as rotas exigem role `ADMIN`.

| Metodo | Rota | O que faz |
|---|---|---|
| GET | `/api/carehub/admin/usuarios` | Lista usuarios locais do CareHub. |
| GET | `/api/carehub/admin/usuarios/{id}` | Busca usuario local por id. |
| PUT | `/api/carehub/admin/usuarios/{id}/status` | Altera status ativo/inativo do usuario. |
| DELETE | `/api/carehub/admin/usuarios/{id}` | Remove logicamente o usuario. |

Corpo para alterar status:

```json
{
  "ativo": false
}
```

## Services principais

### UsuarioSyncService

Responsavel por sincronizar o usuario autenticado da plataforma para o CareHub.

Funcoes principais:

- Criar cliente ou cuidador local.
- Buscar perfil completo.
- Completar ou atualizar perfil.
- Criar especialidades do cuidador quando ainda nao existem.

### CuidadorService

Responsavel por:

- Listar cuidadores.
- Buscar cuidadores com filtros.
- Buscar cuidador por id.
- Atualizar dados do cuidador.
- Remover cuidador por exclusao logica.

### ClienteService

Responsavel por:

- Listar clientes.
- Buscar cliente por id.
- Atualizar dados do cliente.
- Remover cliente por exclusao logica.

### AgendamentoService

Responsavel por:

- Criar agendamentos.
- Alterar status.
- Validar permissoes de cliente/cuidador.
- Propor e aceitar contraproposta.
- Verificar proximos agendamentos.
- Verificar se atendimento pode iniciar.
- Criar registro automatico ao iniciar atendimento.
- Contar pendencias para notificacoes.

### ProntuarioService

Responsavel por:

- Criar prontuario.
- Atualizar prontuario.
- Buscar prontuario por id.
- Buscar prontuario por cliente.

### RegistroAcompanhamentoService

Responsavel por:

- Criar registro de acompanhamento.
- Garantir que o cuidador autenticado pertence ao agendamento.
- Listar registros por cliente, cuidador ou agendamento.

### MensagemService

Responsavel por:

- Enviar mensagens.
- Listar mensagens e conversas.
- Buscar mensagens nao lidas.
- Marcar mensagem ou conversa como lida.
- Listar contatos do chat.
- Verificar se chat esta ativo.

### AvaliacaoService

Responsavel por:

- Criar avaliacao.
- Validar se a avaliacao pertence ao atendimento correto.
- Garantir que o agendamento foi concluido.
- Atualizar media e total de avaliacoes do cuidador.
- Listar avaliacoes de cuidador.

### AlertaEmergenciaService

Responsavel por:

- Cadastrar dispositivo IoT.
- Listar dispositivos do cliente.
- Receber alerta do dispositivo.
- Validar credenciais do dispositivo.
- Criar alerta de emergencia.
- Listar alertas do cliente ou cuidador.
- Reconhecer alerta.

### ScheduledCleanupService

Responsavel por limpar midias antigas do chat.

Configuracao atual:

```text
0 30 3 * * *
```

Ou seja: executa todos os dias as 03:30 e remove midias com mais de 7 dias.

## Fluxo geral do CareHub

### Primeiro acesso

1. Usuario faz login pela plataforma.
2. Frontend chama `/api/carehub/perfil`.
3. Backend identifica o usuario autenticado.
4. `UsuarioSyncService` cria ou encontra o usuario local do CareHub.
5. Usuario completa dados especificos do perfil.

### Contratacao/agendamento de cuidador

1. Cliente busca cuidadores em `/api/carehub/cuidadores/buscar`.
2. Cliente escolhe um cuidador.
3. Cliente cria agendamento.
4. Agendamento nasce `PENDENTE`.
5. Cuidador confirma ou propoe nova data.
6. Cliente aceita contraproposta, se houver.
7. Atendimento fica `CONFIRMADO`.
8. No horario permitido, cuidador inicia atendimento.
9. Atendimento vira `EM_ANDAMENTO` e cria registro automatico.
10. Cuidador conclui atendimento.
11. Cliente avalia o cuidador.

### Chat

1. Cliente e cuidador possuem um agendamento entre si.
2. O chat fica ativo se existir agendamento `PENDENTE`, `CONFIRMADO` ou `EM_ANDAMENTO`.
3. Eles podem trocar mensagens de texto e midia.
4. Mensagens possuem controle de leitura.
5. Midias antigas sao limpas automaticamente.

### Emergencia IoT

1. Cliente cadastra um dispositivo IoT.
2. Backend gera ou recebe `deviceId` e `deviceKey`.
3. Dispositivo fisico guarda essas credenciais.
4. Quando o botao e acionado, o dispositivo chama `/api/carehub/iot/alerts`.
5. Backend valida a chave.
6. Backend cria um alerta `PENDENTE`.
7. Cliente e/ou cuidador consultam alertas.
8. Alerta pode ser marcado como `RECONHECIDO`.

## Observacoes tecnicas importantes

- O schema usado pelo modulo e `care_hub`.
- O arquivo `schema.sql` cria o schema caso ele nao exista.
- O projeto usa JPA/Hibernate com `ddl-auto=update`, entao as tabelas sao mantidas automaticamente pelo Hibernate.
- Algumas rotas trabalham com id da plataforma no frontend e convertem para id local no backend.
- O modulo usa exclusao logica em clientes, cuidadores e administradores atraves de `deletedAt`.
- Rotas administrativas usam `@PreAuthorize("hasRole('ADMIN')")`.
- Algumas rotas de cuidador usam `@PreAuthorize("hasRole('CUIDADOR')")`.
- O dispositivo IoT nao usa login JWT comum; ele autentica por headers `X-Device-Id` e `X-Device-Key`.

## Resumo rapido

O CareHub funciona como um modulo de cuidado assistencial com cinco grandes blocos:

1. **Perfil**: sincroniza o usuario da plataforma e completa dados de cliente/cuidador.
2. **Cuidadores e clientes**: permite consultar e atualizar dados dos participantes.
3. **Agendamentos**: organiza o ciclo do atendimento, incluindo confirmacao, reagendamento, inicio e conclusao.
4. **Acompanhamento**: guarda prontuario, registros do atendimento, chat e avaliacoes.
5. **Emergencia IoT**: permite cadastrar dispositivos e receber alertas reais de emergencia.

Em termos simples: o cliente encontra um cuidador, agenda um atendimento, conversa pelo chat, recebe acompanhamento registrado, avalia o atendimento e pode usar um dispositivo IoT para disparar alertas de emergencia.
