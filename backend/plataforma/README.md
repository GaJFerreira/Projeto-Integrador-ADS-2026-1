# Módulo: Plataforma (Hub Central)

Este é o módulo "Pai" funcional do projeto. Ele detém a autoridade sobre quem pode acessar o sistema e como os dados são persistidos.

## 🛠️ Responsabilidades
- **Segurança (Cybersecurity):** Implementação do filtro de autenticação JWT e regras de CORS.
- **Identidade e Perfil:** Entidades base (`User`, `Role`, `Permission`) e gerenciamento de perfil de usuário com campos dinâmicos por cargo (ex: Médico exige CRM, Cuidador exige Certificação).
- **Central de Atendimento e FAQ:** Controle dinâmico das perguntas frequentes (FAQ) da aplicação agrupadas por módulo, além do recebimento e gestão das mensagens de dúvidas e sugestões enviadas pelos usuários.
- **Configuração Global:** Gerenciamento do arquivo `application.properties` e inicialização de dados (`DataInitializer`).

## 🛡️ Camada de Segurança
Todas as rotas criadas nos módulos filhos são automaticamente interceptadas pelo filtro de segurança deste módulo. O `SecurityConfig` aqui presente define quais perfis (ADMIN, MEDICO, CUIDADOR, PACIENTE) podem acessar quais recursos.

> **Importante:** Módulos filhos não devem criar sistemas de login próprios. Devem utilizar o contexto de segurança injetado por este módulo.