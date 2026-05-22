package br.pucgo.ads.projetointegrador.carehub.controller;

import br.pucgo.ads.projetointegrador.carehub.dto.perfil.PerfilRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.perfil.PerfilResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.service.UsuarioSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Method;

@RestController
@RequestMapping("/api/carehub/perfil")
@RequiredArgsConstructor
@Slf4j
public class CareHubPerfilController {

    private final UsuarioSyncService usuarioSyncService;

    @GetMapping
    public ResponseEntity<PerfilResponseDTO> obterPerfil() {
        Object usuario = obterESincronizarUsuarioLogado();
        PerfilResponseDTO response = usuarioSyncService.obterPerfilCompleto(usuario);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/completar")
    public ResponseEntity<PerfilResponseDTO> completarPerfil(@RequestBody PerfilRequestDTO requestDTO) {
        Object usuario = obterESincronizarUsuarioLogado();
        PerfilResponseDTO response = usuarioSyncService.completarOuAtualizarPerfil(usuario, requestDTO);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<PerfilResponseDTO> atualizarPerfil(@RequestBody PerfilRequestDTO requestDTO) {
        Object usuario = obterESincronizarUsuarioLogado();
        PerfilResponseDTO response = usuarioSyncService.completarOuAtualizarPerfil(usuario, requestDTO);
        return ResponseEntity.ok(response);
    }

    private Object obterESincronizarUsuarioLogado() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String) {
            throw new RuntimeException("Usuário não autenticado no contexto de segurança");
        }

        Object principal = authentication.getPrincipal();

        try {
            // Extrai o platformUserId (getId() de CustomUserDetails)
            Method getIdMethod = principal.getClass().getMethod("getId");
            Long platformUserId = (Long) getIdMethod.invoke(principal);

            // Extrai o User da plataforma (getUser() de CustomUserDetails)
            Method getUserMethod = principal.getClass().getMethod("getUser");
            Object userObj = getUserMethod.invoke(principal);

            // Extrai os campos do User da plataforma
            Method getUsernameMethod = userObj.getClass().getMethod("getUsername");
            String username = (String) getUsernameMethod.invoke(userObj);

            Method getEmailMethod = userObj.getClass().getMethod("getEmail");
            String email = (String) getEmailMethod.invoke(userObj);

            Method getNameMethod = userObj.getClass().getMethod("getName");
            String name = (String) getNameMethod.invoke(userObj);

            // Extrai a Role do User da plataforma (getRole() do User e getName() da Role)
            Method getRoleMethod = userObj.getClass().getMethod("getRole");
            Object roleObj = getRoleMethod.invoke(userObj);
            Method getRoleNameMethod = roleObj.getClass().getMethod("getName");
            String platformRole = (String) getRoleNameMethod.invoke(roleObj);

            // Sincroniza e retorna o usuário local do CareHub
            return usuarioSyncService.sincronizarOuCriar(platformUserId, username, email, name, platformRole);

        } catch (Exception e) {
            log.error("Erro ao obter e sincronizar usuário autenticado via reflexão: {}", e.getMessage(), e);
            throw new RuntimeException("Falha na sincronização de segurança do usuário logado", e);
        }
    }
}
