# Guia de Testes — Sistema de Permissões Granulares

> **Pré-requisito:** Backend rodando em `http://localhost:8080` e frontend em `http://localhost:5173`

---

## Cenário 1 — Compatibilidade retroativa (Admin continua funcionando)

**Objetivo:** Verificar que as mudanças não quebraram o acesso do administrador.

### Pela interface web

1. Acesse `http://localhost:5173` e faça login:
   - **Usuário:** `admin`  **Senha:** `123456`
2. Vá em `/admin/permissoes`
3. Clique em **"Nova permissão"** → preencha o nome `TESTE_ADMIN` → **Salvar**
4. ✅ Deve aparecer na lista — **201 Created** no fundo

---

## Cenário 2 — Atribuir permissão granular a um usuário não-admin

**Objetivo:** O admin atribui `MANAGE_ROLES` ao usuário `cuidador` pelo painel.

### Pela interface web

1. Ainda logado como `admin`, vá em `/admin/usuarios`
2. Clique no nome **"Maria Oliveira Souza"** (cuidador) para editar
3. No campo **"Permissoes (multi-selecao)"** → selecione `MANAGE_ROLES`
4. Clique em **Salvar**
5. ✅ Deve aparecer a mensagem de sucesso

---

## Cenário 3 — Validar que a permissão granular funciona (via API)

**Objetivo:** O cuidador, agora com `MANAGE_ROLES`, consegue chamar `POST /api/permissions`.

### Passo 3.1 — Fazer login como cuidador e pegar o token

**PowerShell:**
```powershell
$loginBody = '{"usernameOrEmail":"cuidador","password":"123456"}'

$response = Invoke-RestMethod `
  -Uri "http://localhost:8080/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginBody

$token = $response.accessToken
Write-Host "Token obtido!"
Write-Host "Role: $($response.roleName)"
Write-Host "Permissoes: $($response.permissions | ConvertTo-Json -Depth 2)"
```

> Verifique na saída que `MANAGE_ROLES` aparece na lista de permissões do response.

### Passo 3.2 — Criar uma permissão como cuidador

```powershell
$permBody = '{"name":"PERMISSAO_DO_CUIDADOR"}'

$resultado = Invoke-RestMethod `
  -Uri "http://localhost:8080/api/permissions" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body $permBody

Write-Host "Permissao criada com ID: $($resultado.id)"
```

✅ **Esperado:** Status `201 Created` com o objeto da permissão criada.

---

## Cenário 4 — Confirmar o bloqueio sem a permissão

**Objetivo:** Sem `MANAGE_ROLES`, o cuidador recebe `403 Forbidden`.

### Passo 4.1 — Remover a permissão pelo painel

1. Login como `admin` → `/admin/usuarios` → editar o cuidador
2. No campo "Permissoes" → **remover** `MANAGE_ROLES` → Salvar

### Passo 4.2 — Repetir o login e a chamada

```powershell
# Login novo (token atualizado sem MANAGE_ROLES)
$response2 = Invoke-RestMethod `
  -Uri "http://localhost:8080/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginBody

$token2 = $response2.accessToken

# Tentar criar permissão
try {
  Invoke-RestMethod `
    -Uri "http://localhost:8080/api/permissions" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token2" } `
    -Body '{"name":"TENTATIVA_BLOQUEADA"}'
} catch {
  Write-Host "Bloqueado! Status: $($_.Exception.Response.StatusCode)"
}
```

✅ **Esperado:** `403 Forbidden` — o sistema bloqueou corretamente.

---

## Resultado esperado por cenário

| Cenário | Ação | Resultado |
|---|---|---|
| 1 | Admin cria permissão | ✅ 201 Created |
| 2 | Admin atribui `MANAGE_ROLES` ao cuidador | ✅ Salvo com sucesso |
| 3 | Cuidador (com `MANAGE_ROLES`) cria permissão | ✅ 201 Created |
| 4 | Cuidador (sem `MANAGE_ROLES`) tenta criar | ✅ 403 Forbidden |

---

## Dica: verificar as authorities no token JWT

Você pode decodificar o token JWT em [jwt.io](https://jwt.io) para inspecionar as claims.
Cole o token e verifique o campo `sub` para confirmar qual usuário está autenticado.

> As authorities são carregadas do banco a cada request pelo `JwtAuthenticationFilter`,
> por isso um novo login reflete imediatamente qualquer mudança de permissão feita pelo admin.
