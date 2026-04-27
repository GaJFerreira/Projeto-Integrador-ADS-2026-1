# Módulo: Plataforma (Hub Central)

Este é o módulo "Pai" funcional do projeto. Ele detém a autoridade sobre quem pode acessar o sistema e como os dados são persistidos.

## 🛠️ Responsabilidades
- **Segurança (Cybersecurity):** Implementação do filtro de autenticação JWT e regras de CORS.
- **Identidade:** Entidades base (`User`, `Role`, `Permission`) e lógica de login/cadastro.
- **Configuração:** Gerenciamento do arquivo `application.properties` e inicialização de dados (`DataInitializer`).

## 🛡️ Camada de Segurança
Todas as rotas criadas nos módulos filhos são automaticamente interceptadas pelo filtro de segurança deste módulo. O `SecurityConfig` aqui presente define quais perfis (ADMIN, CUIDADOR, PACIENTE) podem acessar quais recursos.

> **Importante:** Módulos filhos não devem criar sistemas de login próprios. Devem utilizar o contexto de segurança injetado por este módulo.