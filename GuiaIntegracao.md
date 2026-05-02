# Guia de Integração de Módulos — Projeto Integrador ADS

## Arquitetura do Projeto

```
projeto-integrador/          ← pom.xml raiz (parent de todos)
├── backend/
│   ├── launcher/            ← @SpringBootApplication (único ponto de entrada)
│   ├── plataforma/          ← Biblioteca: User, JWT, Security (NÃO é executável)
│   └── modules/
│       ├── listaCompras/    ← Módulo interno (depende da plataforma)
│       ├── remember/        ← Módulo interno (depende da plataforma)
│       ├── care-keeper/     ← Módulo interno (depende da plataforma)
│       ├── care-hub/        ← Módulo interno (depende da plataforma)
│       ├── dose-certa/      ← Módulo interno (depende da plataforma)
│       ├── elden-care/      ← Módulo interno (depende da plataforma)
│       └── sabor-familia/   ← Módulo EXTERNO (parent próprio, build separado)
```

### Regra de ouro — por que o módulo `launcher` existe?

Módulos precisam usar `User`, `UserRepository` e outros recursos da **plataforma**.
Se a plataforma também dependesse dos módulos, criaria uma **dependência circular** (A→B→A).

**Solução:** O `launcher` é o único que depende de todos. Plataforma e módulos não se conhecem.

```
launcher → plataforma  ✅
launcher → listaCompras  ✅
listaCompras → plataforma  ✅ (para compilar com User, UserRepository)
plataforma → listaCompras  ❌ PROIBIDO — causa ciclo!
```

---

## Como Adicionar um Novo Módulo

### Passo 1 — Criar a pasta do módulo

```
backend/modules/nomeModulo/
├── pom.xml
└── src/main/java/br/pucgo/ads/projetointegrador/nomeModulo/
    ├── controller/
    ├── dto/
    ├── entity/
    ├── repository/
    └── service/
```

> ⚠️ **Importante:** O nome do pacote Java **NÃO pode ter hífen**.
> Use camelCase: `nomeModulo` (não `nome-modulo`).

---

### Passo 2 — Criar o `pom.xml` do módulo

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <!-- Herda dependências comuns do projeto (Spring, JPA, Security, etc.) -->
  <parent>
    <groupId>br.pucgo.ads</groupId>
    <artifactId>projeto-integrador</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <relativePath>../../../pom.xml</relativePath>
  </parent>

  <artifactId>nomeModulo</artifactId>
  <packaging>jar</packaging>
  <name>nomeModulo</name>
  <description>Módulo nomeModulo — descrição do módulo</description>

  <dependencies>
    <!-- Acesso a User, UserRepository, JWT, Security -->
    <dependency>
      <groupId>br.pucgo.ads</groupId>
      <artifactId>plataforma</artifactId>
      <version>${project.version}</version>
    </dependency>

    <!-- Swagger (se usar @Tag, @Operation, @ApiResponse nos controllers) -->
    <dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
      <version>2.8.16</version>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <!-- Este módulo é biblioteca — desativa o repackage do Spring Boot -->
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
        <configuration>
          <skip>true</skip>
        </configuration>
      </plugin>
    </plugins>
  </build>

</project>
```

---

### Passo 3 — Registrar o módulo no `pom.xml` raiz

Abra [`pom.xml`](./pom.xml) e adicione na seção `<modules>`:

```xml
<modules>
  <module>backend/launcher</module>
  <module>backend/plataforma</module>
  <module>backend/modules/remember</module>
  <module>backend/modules/care-keeper</module>
  <module>backend/modules/care-hub</module>
  <module>backend/modules/elden-care</module>
  <module>backend/modules/dose-certa</module>
  <module>backend/modules/listaCompras</module>
  <module>backend/modules/nomeModulo</module>  <!-- ← ADICIONAR AQUI -->
</modules>
```

---

### Passo 4 — Registrar no `launcher/pom.xml`

Abra [`backend/launcher/pom.xml`](./backend/launcher/pom.xml) e adicione nas `<dependencies>`:

```xml
<dependency>
  <groupId>br.pucgo.ads</groupId>
  <artifactId>nomeModulo</artifactId>
  <version>${project.version}</version>
</dependency>
```

---

### Passo 5 — Verificar o pacote Java

O `ProjetointegradorApplication` no `launcher` escaneia automaticamente:
- `br.pucgo.ads.projetointegrador.**` → cobre TODOS os módulos internos

Se o pacote do módulo começa com `br.pucgo.ads.projetointegrador.nomeModulo`, **nenhuma alteração é necessária** no `ProjetointegradorApplication.java`.

Se o módulo usar um pacote diferente (ex: `br.com.empresa.modulo`), adicione em
[`ProjetointegradorApplication.java`](./backend/launcher/src/main/java/br/pucgo/ads/projetointegrador/ProjetointegradorApplication.java):

```java
@SpringBootApplication(scanBasePackages = {
    "br.pucgo.ads.projetointegrador",
    "br.com.puc.saborfamilia",
    "br.com.empresa.modulo"   // ← ADICIONAR SE PACOTE DIFERENTE
})
@EntityScan(basePackages = {
    "br.pucgo.ads.projetointegrador",
    "br.com.puc.saborfamilia",
    "br.com.empresa.modulo"   // ← ADICIONAR SE TIVER @Entity
})
@EnableJpaRepositories(basePackages = {
    "br.pucgo.ads.projetointegrador",
    "br.com.puc.saborfamilia",
    "br.com.empresa.modulo"   // ← ADICIONAR SE TIVER Repository
})
```

---

## Caso especial: Módulo com parent próprio (como sabor-familia)

Se o módulo **já tem seu próprio `<parent>`** (ex: `spring-boot-starter-parent`):

1. **NÃO** listar em `<modules>` no `pom.xml` raiz
2. Adicionar a dependência **no `launcher/pom.xml`** com o groupId correto
3. Adicionar ao **`launcher/pom.xml` como dependência** apenas (não herda do raiz)
4. Adicionar ao **`pom.xml` raiz em `<dependencies>`** (para ser resolvido via .m2)
5. Adicionar o `maven-compiler-plugin` com Lombok no próprio `pom.xml` do módulo
6. **Build separado obrigatório antes do build principal:**
   ```bash
   cd backend/modules/nomeModuloExterno
   ../../../mvnw.cmd install -DskipTests
   ```

---

## Comandos de Build e Execução

### Build completo (primeira vez ou após mudanças)

```bash
# Da raiz do projeto:
./mvnw.cmd install -DskipTests
```

### Executar a aplicação

```bash
# Da raiz do projeto:
./mvnw.cmd spring-boot:run --projects backend/launcher
```

### Build + Run em um comando

```bash
./mvnw.cmd install -DskipTests && ./mvnw.cmd spring-boot:run --projects backend/launcher
```

---

## Estrutura de um Controller padrão

```java
package br.pucgo.ads.projetointegrador.nomeModulo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "NomeModulo", description = "Endpoints do módulo NomeModulo")
@RestController
@RequestMapping("/nome-modulo/recurso")
@RequiredArgsConstructor
public class RecursoController {

    private final RecursoService recursoService;

    @Operation(summary = "Listar recursos")
    @GetMapping
    public ResponseEntity<?> listar() {
        return ResponseEntity.ok(recursoService.listar());
    }
}
```

---

## Resumo visual — Checklist

| Passo | Arquivo | Ação |
|-------|---------|------|
| 1 | `backend/modules/nomeModulo/pom.xml` | Criar com parent raiz + dep plataforma |
| 2 | `pom.xml` (raiz) | Adicionar em `<modules>` |
| 3 | `backend/launcher/pom.xml` | Adicionar em `<dependencies>` |
| 4 | `ProjetointegradorApplication.java` | Só se o pacote Java for diferente |
| 5 | Terminal | `./mvnw.cmd install -DskipTests` |
| 6 | Terminal | `./mvnw.cmd spring-boot:run --projects backend/launcher` |
