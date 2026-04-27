# Backend - Ecossistema Unificado (Monolito Modular)

Este é o núcleo do Projeto Integrador. A arquitetura aqui adotada é a de um **Monolito Modular** gerenciado via **Maven Multi-module**. 

O objetivo desta estrutura é permitir que múltiplos grupos trabalhem em domínios diferentes (DoseCerta, CareHub, etc.) compartilhando a mesma infraestrutura de segurança, banco de dados e servidor, sem que o código de um interfira diretamente no outro.

## 🏗️ Arquitetura do Sistema

O projeto segue o modelo **Hub and Spoke** (Cubo e Raios):
- **O Hub (Plataforma):** Centraliza Autenticação (JWT), Autorização (Roles), Banco de Dados e Configurações Globais.
- **Os Raios (Módulos Filhos):** Implementam as regras de negócio específicas de cada grupo, herdando toda a base da Plataforma.

### Mapa de Módulos

| Módulo | Responsabilidade Principal |
| :--- | :--- |
| **plataforma** | Gestão de Usuários, Segurança JWT, Permissões e Inicialização do Sistema. |
| **sabor-da-familia** | Gestão nutricional e receitas para a terceira idade. |
| **remember** | Auxílio de memória e recordações para pacientes com declínio cognitivo. |
| **care-keeper** | Gestão operacional de rotinas de cuidados. |
| **care-hub** | Marketplace e conexão entre cuidadores e familiares. |
| **elden-care** | Monitoramento e assistência dedicada a idosos. |
| **dose-certa** | Controle de medicamentos, alertas e integração com SMS. |

## 🚀 Como Executar

### Pré-requisitos
- Java 17+
- Maven 3.6+
- Banco de Dados MySQL/PostgreSQL configurado no `application.properties` da Plataforma.

### Comandos Iniciais
Para compilar todos os módulos simultaneamente, execute na raiz desta pasta:
```bash
mvn clean install
