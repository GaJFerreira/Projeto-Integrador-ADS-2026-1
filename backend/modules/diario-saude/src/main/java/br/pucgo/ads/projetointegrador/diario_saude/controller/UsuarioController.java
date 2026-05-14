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

    /**
     * Busca (ou cria) o registro clínico de um usuário da plataforma.
     * O nome vem do token JWT via Authentication.
     */
    @GetMapping("/por-user/{platformUserId}")
    public ResponseEntity<UsuarioDTO> buscarPorPlatformUserId(
            @PathVariable Long platformUserId,
            Authentication authentication) {

        String nome = authentication != null ? authentication.getName() : null;
        UsuarioEntity entity = usuarioService.buscarOuCriarPaciente(platformUserId, nome);
        UsuarioDTO dto = new UsuarioDTO(entity);
        dto.setPlatformUserId(entity.getPlatformUserId());

        return ResponseEntity.ok(dto);
    }
}
