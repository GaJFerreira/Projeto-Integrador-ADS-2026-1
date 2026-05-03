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
  Serviço Core (núcleo) da aplicação. Responsável pela segurança (SecurityConfig, JWT), gestão de usuários, papéis (roles) e permissões.

* **`sabor-da-familia/`**
  Serviço focado em receitas culinárias, contendo funcionalidades de curtidas, favoritos, comentários, restrições alimentares, chat e feed de usuários.

* **Outros serviços:**
  `care-hub/`, `care-keeper/`, `dose-certa/`, `elden-care/`, `remember/`
  (Microsserviços de apoio para gestão de saúde e lembretes).

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

O backend utiliza o padrão de Monolito Modular e possui um ponto de entrada único através do módulo `launcher`. O `launcher` carrega todos os módulos ao mesmo tempo e resolve problemas de dependências, não sendo necessário rodá-los separadamente.

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd Projeto-Integrador-ADS-2026-1
```

---

### 2. Configuração do Banco de Dados

* Crie os bancos de dados no PostgreSQL conforme esperado pelos módulos
* Verifique os arquivos:

```
backend/plataforma/src/main/resources
backend/sabor-da-familia/src/main/resources
```

* Ajuste as credenciais:

```
spring.datasource.username
spring.datasource.password
```

---

### 3. Iniciando o Backend Integrado (Launcher)

Use o módulo `launcher` para rodar o backend. Ele carrega automaticamente a plataforma e todos os módulos de uma só vez.

Na raiz do projeto, execute:

```bash
./mvnw spring-boot:run --projects backend/launcher
```
Ou entre na pasta do launcher e execute:
```bash
cd backend/launcher
../mvnw spring-boot:run
```

As APIs estarão disponíveis de forma centralizada em:

```
http://localhost:8080
```

Todas as rotas e módulos responderão na mesma porta unificada.

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

## Integração de novos módulos

📘 Guia básico:
[Guia de integração de novos módulos](./GUIA_INTEGRACAO_MODULOS.md)

---

## 🤝 Colaboração e Versionamento

> ⚠️ **Importante:** Antes de contribuir com o projeto, é obrigatório ler o guia de versionamento para evitar rejeição automática de commits e Pull Requests.

📘 Guia completo:
[Guia de Versionamento e Colaboração](./GUIA_VERSIONAMENTO.md)

