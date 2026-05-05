# Guia: Como tornar seu módulo independente da plataforma

> **Para:** todos os grupos do Projeto Integrador ADS 2026-1  
> **Contexto:** Monólito modular com `launcher` + `plataforma` + módulos independentes

---

## 1. Por que fazer essa mudança?

O projeto usa uma arquitetura de **monólito modular**: cada grupo desenvolve seu módulo separadamente, e todos são reunidos pelo `launcher` na hora de rodar.

Para isso funcionar, **cada módulo precisa compilar sozinho**, sem depender do código de outros módulos.

### O problema: acoplamento com a plataforma

Se o seu módulo tem algo assim no código:

```java
// ❌ ERRADO — importa classe de outro módulo
import br.pucgo.ads.projetointegrador.plataforma.entity.User;

public class MeuUsuario extends User { ... }
```

Isso significa que **seu módulo não compila sem a plataforma**. Isso gera:

- Dependência circular no Maven (A depende de B que depende de A)
- Impossibilidade de trabalhar no módulo de forma isolada
- Build quebrado quando outro grupo muda a `plataforma.User`

### A solução: módulo 100% autônomo

Cada módulo deve ter **suas próprias entidades, tabelas e banco de dados** — sem herdar nem importar classes de outros módulos.

A referência ao usuário da plataforma (autenticação/JWT) é feita apenas por **ID numérico** (`Long`), sem importar a classe.

> Esse é exatamente o padrão que o módulo `sabor-familia` já usa.

---

## 2. Checklist de mudanças

### ✅ Passo 1 — Criar sua entidade de usuário local

Se seu módulo tem usuários (perfis, contas, etc.), crie uma entidade **própria**, sem `extends User` da plataforma.

**Antes (❌ errado):**
```java
import br.pucgo.ads.projetointegrador.plataforma.entity.User;

public class MeuUsuario extends User {
    private String campoEspecifico;
}
```

**Depois (✅ correto):**
```java
package br.pucgo.ads.projetointegrador.seumodulo.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;

@Entity
@Table(name = "usuario", schema = "seu_modulo")   // ← schema próprio!
@Data @NoArgsConstructor @AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID do usuário autenticado na plataforma.
     * Apenas um número — sem import de classe externa.
     */
    @Column(name = "platform_user_id")
    private Long platformUserId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password;

    private String name;
    private String phone;
    private String status;

    // Role do módulo como String simples (ex: "MEUSISTEMA_ADMIN")
    @Column(name = "role", length = 64)
    private String role;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;
}
```

> **Dica:** adicione apenas os campos que **seu módulo realmente usa**. Não precisa copiar tudo do `User` da plataforma.

---

### ✅ Passo 2 — Usar schema próprio em TODAS as entidades

Todas as entidades do seu módulo devem declarar um `schema` exclusivo:

```java
// ✅ Correto — todas as tabelas ficam no schema do seu módulo
@Table(name = "pedido", schema = "seu_modulo")
@Table(name = "item_pedido", schema = "seu_modulo")
@Table(name = "usuario", schema = "seu_modulo")
```

**Por que?** Evita conflito de nomes de tabela com outros módulos e mantém o banco organizado por módulo.

Para tabelas de junção (N:N), também declare o schema:
```java
@JoinTable(
    name = "usuario_produto",
    schema = "seu_modulo",          // ← obrigatório
    joinColumns = @JoinColumn(name = "usuario_id"),
    inverseJoinColumns = @JoinColumn(name = "produto_id")
)
```

---

### ✅ Passo 3 — Remover imports da plataforma de todos os arquivos

Faça uma busca no seu projeto por importações da plataforma:

```
# Buscar todos os imports de plataforma no seu módulo
grep -r "import br.pucgo.ads.projetointegrador.plataforma" src/
```

Cada arquivo encontrado precisa ser corrigido. Os casos mais comuns são:

| Antes (❌) | Depois (✅) |
|---|---|
| `import ...plataforma.entity.User` | Use sua entidade local |
| `import ...plataforma.entity.Role` | Use `String role` |
| `import ...plataforma.repository.UserRepository` | Crie seu próprio Repository |
| `import ...plataforma.repository.RoleRepository` | Não use — role é uma String |
| `import ...plataforma.security.JwtAuthenticationFilter` | Remova — o launcher cuida disso |

---

### ✅ Passo 4 — Criar seu próprio Repository

```java
// ✅ Repository operando sobre entidade local
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByUsername(String username);
    Optional<Usuario> findByUsernameOrEmail(String username, String email);
    boolean existsByEmail(String email);
}
```

---

### ✅ Passo 5 — Atualizar o `pom.xml` do seu módulo

**Remova** a dependência da plataforma e declare as dependências diretamente:

**Antes (❌):**
```xml
<dependencies>
    <dependency>
        <groupId>br.pucgo.ads</groupId>
        <artifactId>plataforma</artifactId>
        <version>${project.version}</version>
    </dependency>
</dependencies>
```

**Depois (✅):**
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.8.16</version>
    </dependency>
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <!-- Módulo não inicia sozinho — o launcher faz isso -->
                <skip>true</skip>
            </configuration>
        </plugin>
    </plugins>
</build>
```

---

### ✅ Passo 6 — Simplificar o SecurityConfig (se tiver um)

Se seu módulo tem um `SecurityConfig` que importa `JwtAuthenticationFilter` da plataforma, substitua por uma config mínima:

```java
package br.pucgo.ads.projetointegrador.seumodulo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SeuModuloSecurityConfig {

    @Bean
    @Order(2) // Depois da plataforma (que tem o filtro JWT)
    public SecurityFilterChain seuModuloFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/seumodulo/**")
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // JWT validado pelo filtro da plataforma
            );
        return http.build();
    }
}
```

> O filtro JWT da plataforma já protege todos os endpoints quando rodando via `launcher`. Esta config apenas garante a compilação standalone.

---

### ✅ Passo 7 — Verificar a compilação

```bash
# Na raiz do projeto (onde está o mvnw.cmd)
.\mvnw.cmd clean compile -pl backend/modules/seu-modulo --no-transfer-progress
```

O resultado deve ser:
```
[INFO] BUILD SUCCESS
```

E uma verificação final — zero imports da plataforma:
```bash
# Deve retornar vazio (nenhum resultado)
grep -r "import br.pucgo.ads.projetointegrador.plataforma" backend/modules/seu-modulo/src/
```

---

## 3. Dúvidas frequentes

**Q: Mas e a autenticação? Como meu módulo sabe quem está logado?**  
R: O JWT é validado pela plataforma. Dentro do seu controller, você usa `principal.getName()` para pegar o username/email do usuário logado, e busca no seu próprio banco local.

**Q: E se meu módulo não tem usuários próprios?**  
R: Melhor ainda — apenas guarde o `Long platformUserId` nas suas entidades quando precisar referenciar quem fez uma ação. Sem import de classe, sem herança.

**Q: E o banco de dados? Vai ter uma tabela `usuario` em cada módulo?**  
R: Sim — mas em schemas diferentes (`care_hub.usuario`, `sabor_familia.perfil`, etc.). Cada módulo tem seu próprio espaço no banco. Isso é exatamente o modelo que o `sabor-familia` usa.

**Q: Preciso recriar as tabelas no banco?**  
R: Se você usar `spring.jpa.hibernate.ddl-auto=update` no `application.properties` do launcher, o Hibernate cria o schema e as tabelas automaticamente. Se tiver dados antigos nas tabelas velhas, precisará migrá-los manualmente.

---

## 4. Exemplo real: como o `sabor-familia` faz

O módulo mais maduro do projeto é o `sabor-familia`. Ele tem:

- **Schema próprio:** `@Table(name = "perfil", schema = "sabor_familia")`
- **Referência opaca ao usuário:** `@Column(name = "usuario_id") private Long usuarioId;`
- **Nenhum import da plataforma** no código-fonte
- **`pom.xml`** sem dependência da plataforma

Use-o como referência ao refatorar seu módulo.

---

## 5. Resumo rápido (TL;DR)

| Regra | Como fazer |
|---|---|
| Não herdar `plataforma.User` | Crie sua própria entidade `Usuario` |
| Não importar `plataforma.*` | Cada módulo tem suas próprias classes |
| Referenciar o usuário da plataforma | Use apenas `Long platformUserId` |
| Separar tabelas por módulo | `@Table(schema = "nome_do_seu_modulo")` |
| Role do usuário | Use `String role` simples (`"SEUMOD_ADMIN"`) |
| Segurança JWT | O launcher cuida — apenas herde o `@Order(2)` config |
| `pom.xml` | Sem `<artifactId>plataforma</artifactId>` |
