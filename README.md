# Projeto Integrador ADS 2026-1

Bem-vindo ao repositório do **Projeto Integrador ADS 2026-1**. Este projeto é uma plataforma abrangente voltada para a área da saúde, cuidado e bem-estar (com foco em público sênior e cuidadores), dividida em múltiplos módulos e serviços, como o *Sabor da Família*, *Dose Certa*, *Elden Care*, entre outros.

---

## 🏗️ Arquitetura Geral

O projeto adota uma arquitetura em **Monorepo**, contendo tanto o código do servidor (Backend) quanto o código do cliente (Frontend) no mesmo repositório.

* **Backend:** Desenvolvido em **Java** com o framework **Spring Boot**. A arquitetura é modular (orientada a microsserviços/módulos), onde cada serviço possui sua própria responsabilidade.
* **Frontend:** Desenvolvido em **React** utilizando **TypeScript** e **Vite**. A estrutura de pastas é baseada em *Features* (funcionalidades), garantindo alta coesão e fácil escalabilidade.
* **Banco de Dados:** PostgreSQL (conforme scripts de dados encontrados no projeto).

---

## 📂 Estrutura do Projeto

O repositório está dividido em duas pastas principais:

### `/backend`

Contém as APIs da aplicação, divididas nos seguintes módulos principais:

* **`plataforma/`**
  Serviço Core (núcleo) da aplicação. Responsável pela segurança, gestão unificada de usuários e perfis (CRM, Certificações, etc.), autenticação (JWT) e também por gerenciar o sistema dinâmico de Dúvidas, Sugestões e FAQ do portal.

* **`sabor-da-familia/`**
  Serviço focado em receitas culinárias, contendo funcionalidades de curtidas, favoritos, comentários, restrições alimentares, chat e feed de usuários.

* **`dose-certa/`** *(Em desenvolvimento na branch funcional)*
  Módulo de gestão e lembretes de medicamentos. Focado em garantir a adesão correta aos tratamentos médicos, emitindo alertas sobre horários e controle de posologia.

* **`care-hub/`**
  Sistema central de monitoramento. Conecta pacientes a médicos e cuidadores, emitindo alertas em tempo real sobre situações de atenção ou emergência.

* **`remember/`**
  Diário cognitivo que estimula a memória através de registros diários. Possui um sistema gamificado de conquistas para incentivar a regularidade e acompanhar a evolução cognitiva.

* **`elden-care/`**
  Focado na saúde física e mobilidade. Gera planos de exercícios físicos personalizados para idosos baseados em questionários prévios de condicionamento físico.

* **`lista-compras/`** *(Compre com Saúde)*
  Gestão inteligente de listas de supermercado. Fornece templates alimentares e dicas alinhadas às restrições nutricionais e de saúde dos usuários.

* **Outros serviços em andamento:**
  `care-keeper/`, `diario-saude/`
  (Microsserviços de apoio para acompanhamento biométrico e consultas médicas).

---

### `/frontend`

Contém a aplicação web (SPA):

* **`src/features/`** (organização por domínios)

  * `admin/`: Gestão de usuários, médicos, cuidadores e permissões
  * `auth/`: Login e autenticação integrada ao backend (`plataforma`)
  * `atendimento/`: Telas e fluxos para atendimento médico

* **`src/theme/`**
  Configurações globais de design e estilos.

* **`src/lib/`**
  Configurações de infraestrutura do frontend (clientes HTTP como Axios/Fetch).

---

## 🚀 Como Executar o Projeto Localmente

### ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

* Java 21
* Maven (opcional — o projeto inclui `mvnw`)
* Node.js (versão 18 ou superior)
* PostgreSQL rodando localmente (ou via Docker)

---

## ⚙️ Executando o Backend

Como o backend é modular, todas as dependências estão unificadas através da `plataforma`. Você só precisa rodar o módulo Core a partir da raiz do projeto para que todos os outros submódulos (como Sabor da Família, Remember, etc.) subam juntos.

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd Projeto-Integrador-ADS-2026-1
```

---

### 2. Configuração do Banco de Dados

* Crie um banco de dados chamado `projeto_integrador` no PostgreSQL.
* Verifique/Ajuste as credenciais no arquivo central:

```
backend/plataforma/src/main/resources/application.properties
```

```properties
spring.datasource.username=postgres
spring.datasource.password=sua_senha
```

---

### 3. Iniciando a Aplicação Completa (Plataforma + Módulos)

No terminal, estando **na raiz do projeto** (`Projeto-Integrador-ADS-2026-1`), execute o seguinte comando:

**No Windows:**
```bash
./mvnw.cmd spring-boot:run --projects backend/plataforma
```

**No Linux/Mac:**
```bash
./mvnw spring-boot:run --projects backend/plataforma
```

A API estará disponível na porta padrão:
```
http://localhost:8080
```

---

## 💻 Executando o Frontend

### 1. Acesse a pasta

```bash
cd frontend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Inicie o servidor

```bash
npm run dev
```

### 4. Acesse no navegador

O terminal exibirá a URL local, geralmente:

```
http://localhost:5173
```

---

## 🧪 Testando as APIs (Postman)

O projeto já inclui coleções prontas para testes:

* `Postman_Collection_Complete_API.json`
* `Postman_Environment_Complete.json`
* `backend/sabor-da-familia/docs/postman/sabor-familia.postman_collection.json`

### Como usar:

1. Importe os arquivos no Postman ou Insomnia
2. Configure o ambiente
3. Gere o token JWT
4. Teste os endpoints protegidos

---

## 📌 Observações

Este README inclui:

* Visão geral do projeto
* Explicação da arquitetura (monorepo, backend modular, frontend por features)
* Guia completo de execução local
* Integração com ferramentas de teste (Postman)

* ## 📌 Observações

...

## 🤝 Colaboração e Versionamento

> ⚠️ **Importante:** Antes de contribuir com o projeto, é obrigatório ler o guia de versionamento para evitar rejeição automática de commits e Pull Requests.

📘 Guia completo:
[Guia de Versionamento e Colaboração](./GUIA_VERSIONAMENTO.md)
