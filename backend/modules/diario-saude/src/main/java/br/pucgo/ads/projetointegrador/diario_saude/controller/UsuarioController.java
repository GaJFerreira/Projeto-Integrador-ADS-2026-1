package br.pucgo.ads.projetointegrador.diario_saude.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import br.pucgo.ads.projetointegrador.diario_saude.dto.UsuarioDTO;
import br.pucgo.ads.projetointegrador.diario_saude.entity.UsuarioEntity;
import br.pucgo.ads.projetointegrador.diario_saude.service.UsuarioService;

@RestController
@RequestMapping(value = "/api/diario_saude/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioDTO> listarTodos() {
        return usuarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PostMapping
    public void inserir(@RequestBody UsuarioDTO usuario) {
        usuarioService.inserir(usuario);
    }

    @PutMapping
    public UsuarioDTO alterar(@RequestBody UsuarioDTO usuario) {
        return usuarioService.alterar(usuario);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        usuarioService.excluir(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/por-user/{platformUserId}")
    public ResponseEntity<UsuarioDTO> buscarPorPlatformUserId(
            @PathVariable Long platformUserId,
            @RequestParam(required = false) String nome,
            Authentication authentication) {

        // Prioridade: 1) nome vindo do frontend (query param)
        // 2) getUsername() via reflexão — que na plataforma é o nome real
        // 3) fallback para authentication.getName() (email)
        String nomeReal = nome;

        if (nomeReal == null || nomeReal.isBlank() || nomeReal.contains("@")) {
            nomeReal = extrairNomeViaReflexao(authentication);
        }

        if (nomeReal == null || nomeReal.isBlank()) {
            nomeReal = authentication != null ? authentication.getName() : null;
        }

        UsuarioEntity entity = usuarioService.buscarOuCriarPaciente(platformUserId, nomeReal);
        UsuarioDTO dto = new UsuarioDTO(entity);
        dto.setPlatformUserId(entity.getPlatformUserId());

        return ResponseEntity.ok(dto);
    }

    private String extrairNomeViaReflexao(Authentication authentication) {
        if (authentication == null)
            return null;
        try {
            Object principal = authentication.getPrincipal();
            Object user = principal.getClass().getMethod("getUser").invoke(principal);
            // Tenta getUsername() primeiro — na plataforma é o nome real
            try {
                String username = (String) user.getClass().getMethod("getUsername").invoke(user);
                if (username != null && !username.isBlank() && !username.contains("@"))
                    return username;
            } catch (Exception ignored) {
            }
            // Tenta getName() como fallback
            String name = (String) user.getClass().getMethod("getName").invoke(user);
            if (name != null && !name.isBlank() && !name.contains("@"))
                return name;
        } catch (Exception ignored) {
        }
        return null;
    }
}