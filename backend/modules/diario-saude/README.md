# 🏥 Módulo Diário da Saúde — Plataforma UNATI

> **Projeto Integrador ADS 2026-1 · PUC Goiás**  
> Repositório: https://github.com/Projeto-Integrador-Puc-Goias/Projeto-Integrador-ADS-2026-1.git

---

## 📋 Visão Geral

O **Diário da Saúde** é o módulo responsável pelo acompanhamento clínico dos usuários idosos na Plataforma UNATI. Ele centraliza consultas médicas, prescrições, exames, exercícios, alergias, doenças e questionários de saúde em um único lugar.

O módulo opera com schema de banco de dados próprio (`diario_saude`), separado do schema da plataforma principal (`plataforma`), integrando-se via `platform_user_id`.

---

## 🚀 Tecnologias

### Backend
| Tecnologia | Detalhe |
|---|---|
| Java 21 | Linguagem principal |
| Spring Boot 3.x | Framework principal (módulo Maven filho) |
| Spring Data JPA | Persistência com Hibernate |
| Spring Security | JWT via filtro da plataforma |
| PostgreSQL 17 | Banco de dados — schema `diario_saude` |
| Maven | Build e gerenciamento de dependências |

### Frontend
| Tecnologia | Detalhe |
|---|---|
| React 18 + TypeScript | UI principal |
| Vite | Bundler e dev server |
| Material UI v6 | Componentes de interface |
| React Query (@tanstack) | Gerenciamento de estado assíncrono |
| React Router v6 | Navegação SPA |
| Axios | Requisições HTTP |

---

## 📁 Estrutura do Projeto

### Backend
```
diario-saude/
├── pom.xml
└── src/main/java/.../diario_saude/
    ├── config/         # Inicializadores de dados (alergias, doenças, medicamentos...)
    ├── controller/     # 16 REST Controllers
    ├── dto/            # Data Transfer Objects
    ├── entity/         # Entidades JPA (schema diario_saude)
    ├── exception/      # Exceções customizadas
    ├── repository/     # Interfaces Spring Data JPA
    └── service/        # Regras de negócio
```

### Frontend
```
src/features/diario_saude/
├── Admin/
│   ├── AdminVinculoCuidadorPage.tsx
│   ├── CadastroAlergiaDoencaPage.tsx
│   └── GerenciarQuestionarioPage.tsx
├── Cuidador/
│   ├── CuidadorPacientesPage.tsx
│   └── CuidadorDadosBiometricosPage.tsx
├── Idoso/
│   ├── DadosBiometricosPage.tsx
│   ├── HistoricoConsultasPage.tsx
│   ├── InformacoesSaude.tsx
│   ├── QuestionarioPage.tsx
│   └── SaudeMenuPage.tsx
├── Medico/
│   ├── MedicoDashboard.tsx
│   ├── IniciarConsultaPage.tsx
│   ├── ReceituarioPage.tsx
│   ├── PedirExamesPage.tsx
│   ├── AlergiasPage.tsx
│   ├── DiagnosticarDoencaPage.tsx
│   └── RegistrarResultadoExamePage.tsx
├── api/                # Funções de chamada à API e tipos TypeScript
└── components/         # Componentes reutilizáveis (ModuleGrid, RoundedButton...)
```

---

## 🗄️ Banco de Dados

### Schema
O módulo usa o schema `diario_saude` no PostgreSQL. A integração com a plataforma é feita pela coluna `platform_user_id` na tabela `usuario_info_clinica`, que referencia `plataforma.users.id`.

### Principais Tabelas
| Tabela | Descrição |
|---|---|
| `ds_usuario_info_clinica` | Dados clínicos do paciente (peso, altura, data de nascimento) |
| `ds_prescricao_medica` | Consultas e prescrições médicas |
| `ds_prescricao_medicamento` | Medicamentos de cada prescrição |
| `ds_prescricao_exame` | Exames solicitados em cada prescrição |
| `ds_exercicio_recomendado` | Exercícios recomendados pelo médico |
| `ds_usuario_doencas` | Doenças associadas ao paciente |
| `ds_usuario_alergia` | Alergias do paciente |
| `ds_usuario_medicamento` | Medicamentos em uso contínuo |
| `ds_pergunta` | Perguntas do questionário de saúde |
| `ds_resposta_questionario` | Respostas dos pacientes ao questionário |
| `ds_cuidador_paciente` | Vínculos entre cuidadores e pacientes |
| `ds_medicamento` | Catálogo de medicamentos (7.484 registros) |
| `ds_alergia` | Catálogo de alergias |
| `ds_doenca` | Catálogo de doenças CID-10 |
| `ds_exame` | Catálogo de exames laboratoriais |

### Padrão Dual-ID
O módulo utiliza dois IDs para integrar autenticação e dados clínicos:
- **`platform_user_id`** — ID do usuário na tabela `plataforma.users` (JWT)
- **`id_usuario`** — ID na tabela `diario_saude.ds_usuario_info_clinica` (dados clínicos)

O endpoint `GET /api/diario_saude/usuario/por-user/{platformUserId}` resolve essa ponte automaticamente, criando o registro clínico caso não exista (**padrão buscarOuCriar**).

---

## 👤 Perfis e Funcionalidades

### 🧓 Idoso (ROLE_IDOSO)
- **Dados Biométricos** — Atualizar peso, altura e data de nascimento. IMC calculado automaticamente.
- **Prontuário** — Visualizar histórico completo: consultas, medicamentos, exames, doenças e alergias.
- **Questionário de Saúde** — Responder avaliação com pontuação automática.
- **Histórico de Consultas** — Consultar todas as prescrições médicas recebidas.

### 👨‍⚕️ Médico (ROLE_MEDICO)
- **Iniciar Consulta** — Selecionar paciente e criar/reutilizar prescrição médica.
- **Dashboard Médico** — Visão geral do paciente com acesso a todas as ferramentas clínicas.
- **Receituário** — Prescrever medicamentos com dosagem, frequência e via.
- **Pedir Exames** — Solicitar exames laboratoriais.
- **Registrar Resultado de Exames** — Inserir resultados de exames realizados.
- **Exercícios** — Recomendar exercícios físicos.
- **Diagnosticar Doenças** — Registrar diagnósticos CID-10.
- **Alergias** — Gerenciar alergias do paciente.
- **Respostas do Questionário** — Visualizar respostas e pontuação do paciente.

### 🧑‍🤝‍🧑 Cuidador (ROLE_CUIDADOR)
- **Meus Pacientes** — Listar e pesquisar pacientes vinculados, com busca por nome.
- **Dados Biométricos** — Visualizar e atualizar dados biométricos de pacientes vinculados.
- **Prontuário** — Visualizar histórico de saúde do paciente (somente leitura).

### 🔧 Administrador (ROLE_ADMIN)
- **Gerenciar Questionário** — Adicionar, editar e excluir perguntas.
- **Cadastro de Alergias e Doenças** — Gerenciar catálogos do sistema.
- **Vínculos Cuidador-Paciente** — Vincular e desvincular cuidadores a pacientes.

---

## 🌐 Endpoints da API REST

> Todos os endpoints exigem: `Authorization: Bearer {token}`  
> Base URL: `/api/diario_saude`

### Usuário (Paciente)
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/usuario` | Listar todos os registros clínicos |
| GET | `/usuario/{id}` | Buscar por ID |
| GET | `/usuario/por-user/{platformUserId}` | Buscar ou criar registro clínico pelo ID da plataforma |
| POST | `/usuario` | Criar registro clínico |
| PUT | `/usuario` | Atualizar dados (peso, altura, data de nascimento) |
| DELETE | `/usuario/{id}` | Remover registro |

### Prescrição Médica
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/prescricao` | Listar todas as prescrições |
| GET | `/prescricao/usuario/{id}` | Listar prescrições de um paciente |
| POST | `/prescricao` | Criar nova prescrição |
| PUT | `/prescricao` | Atualizar prescrição |
| DELETE | `/prescricao/{id}` | Remover prescrição |

### Cuidador-Paciente
| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/cuidador-paciente/vincular` | Vincular cuidador a paciente (`?cuidadorPlatformId=&pacienteId=`) |
| DELETE | `/cuidador-paciente/desvincular` | Desvincular (`?cuidadorPlatformId=&pacienteId=`) |
| GET | `/cuidador-paciente/pacientes/{cuidadorPlatformId}` | Listar pacientes de um cuidador |

### Demais Recursos
| Recurso | Base | Operações |
|---|---|---|
| Medicamentos | `/medicamento` | GET (lista, busca por nome), POST, PUT, DELETE |
| Prescrição Medicamento | `/prescricao-medicamento` | GET por prescrição, POST, DELETE |
| Exames | `/exame` | GET, POST, PUT, DELETE |
| Prescrição Exame | `/prescricao-exame` | GET por prescrição, POST, DELETE |
| Exercícios | `/exercicio-recomendado` | GET por prescrição, POST, PUT, DELETE |
| Alergias | `/alergia` | GET (lista/busca), POST, DELETE |
| Usuário Alergia | `/usuario-alergia` | GET por usuário, POST, DELETE |
| Doenças CID-10 | `/doenca` | GET (lista/busca por código ou nome) |
| Usuário Doenças | `/usuario-doenca` | GET por usuário, POST, DELETE |
| Medicamento Contínuo | `/usuario-medicamento` | GET por usuário, POST, DELETE |
| Questionário | `/pergunta` | GET, POST, PUT, DELETE |
| Respostas | `/questionario-resposta` | GET por usuário, POST |
| Médico | `/medico` | GET, POST, PUT, DELETE |

---

## 🗺️ Rotas do Frontend

| Rota | Componente | Perfil |
|---|---|---|
| `saude` | SaudeMenuPage | Todos |
| `dados_biometricos` | DadosBiometricosPage | Idoso |
| `informacoes_saude` | InformacoesSaude | Idoso |
| `historico_consultas` | HistoricoConsultasPage | Idoso |
| `questionario_saude` | QuestionarioPage | Idoso |
| `informacoesSaude` | InformacoesSaude | Médico / Cuidador (leitura) |
| `medico` | IniciarConsultaPage | Médico |
| `atendimento/dashboard` | MedicoDashboard | Médico |
| `atendimento/receituario` | ReceituarioPage | Médico |
| `atendimento/exames` | PedirExamesPage | Médico |
| `atendimento/resultado-exames` | RegistrarResultadoExamePage | Médico |
| `atendimento/exercicios` | RecomendacaoExerciciosPage | Médico |
| `atendimento/alergias` | AlergiasPage | Médico |
| `atendimento/doencas` | DiagnosticarDoencaPage | Médico |
| `atendimento/historico-medico` | HistoricoConsultasMedicoPage | Médico |
| `medico/respostas-questionario` | MedicoRespostasQuestionarioPage | Médico |
| `cuidador/pacientes` | CuidadorPacientesPage | Cuidador |
| `cuidador/biometricos` | CuidadorDadosBiometricosPage | Cuidador |
| `admin/questionario` | GerenciarQuestionarioPage | Admin |
| `admin/cadastro-alergia-doenca` | CadastroAlergiaDoencaPage | Admin |
| `admin/vinculos-cuidador` | AdminVinculoCuidadorPage | Admin |

---

## 📦 Dados Inicializados Automaticamente

Na primeira execução, o sistema popula automaticamente:

| Inicializador | Dados | Volume |
|---|---|---|
| `MedicamentosDataInitializer` | Catálogo de medicamentos (via CSV) | 7.484 registros |
| `AlergiasDataInitializer` | Catálogo de alergias (JSON) | Variável |
| `DoencasDataInitializer` | Doenças CID-10 (JSON) | Variável |
| `ExamesDataInitializer` | Exames laboratoriais (JSON) | Variável |
| `PerguntasDataInitializer` | Questionário de saúde (JSON) | Variável |

---

## ⚙️ Como Executar

### Pré-requisitos
- Java 21+
- Node.js 18+
- PostgreSQL 15+ com os schemas criados
- Maven 3.8+

### Criação dos Schemas
```sql
CREATE SCHEMA IF NOT EXISTS plataforma;
CREATE SCHEMA IF NOT EXISTS diario_saude;
```

### Backend
Na raiz do projeto integrador:
```bash
mvn clean install
mvn spring-boot:run -pl plataforma
```
O servidor sobe em `http://localhost:8080`. As tabelas são criadas automaticamente via `ddl-auto=update`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
O frontend sobe em `http://localhost:5173`.

---

## 🏗️ Decisões de Arquitetura

### Separação de Schemas
O módulo opera em schema próprio (`diario_saude`) para garantir isolamento dos demais módulos do projeto integrador. A integração com a plataforma é feita exclusivamente via `platform_user_id`, sem acesso direto às entidades da plataforma.

### Padrão buscarOuCriar
Ao acessar dados clínicos pela primeira vez, o sistema cria automaticamente um registro inicial com valores zerados. Isso garante que todos os fluxos funcionem para usuários recém-cadastrados sem passos manuais adicionais.

### Autenticação Delegada
O módulo não implementa autenticação própria. Toda segurança é delegada ao filtro JWT da plataforma principal (`JwtAuthenticationFilter`), que valida o token em todas as requisições para `/api/diario_saude/*`.

### Controle de Roles no Frontend
O componente `ModuleGridSaude` detecta o perfil do usuário via `localStorage` e renderiza o grid correspondente: `ModuleGridIdoso`, `ModuleGridMedicoSaude`, `ModuleGridCuidador` ou `ModuleGridAdmin`.

---

## 👨‍💻 Autor

| Campo | Informação |
|---|---|
| Nome | Halisson Franca Martins - Bruno da Silva - Rodrigo Gomes |
| Curso | Análise e Desenvolvimento de Sistemas |
| Instituição | PUC Goiás |
| Período | 2026-1 |
| Módulo | Diário da Saúde — Projeto Integrador |
| Repositório | [https://github.com/Projeto-Integrador-Puc-Goias/Projeto-Integrador-ADS-2026-1.git] |
| Documentação EOR | [https://docs.google.com/document/d/1mQydRicV_bhSjXnT74LDAAbtvC05Whba/edit?usp=sharing&ouid=104387098543579228616&rtpof=true&sd=true]
---

*Plataforma UNATI — Diário da Saúde · PUC Goiás ADS 2026-1*
