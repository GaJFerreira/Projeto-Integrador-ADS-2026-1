package br.pucgo.ads.projetointegrador.remember.controller;

import br.pucgo.ads.projetointegrador.remember.dto.conquista.RankingResponseDTO;
import br.pucgo.ads.projetointegrador.remember.dto.conquista.UsuarioConquistaRequestDTO;
import br.pucgo.ads.projetointegrador.remember.dto.conquista.UsuarioConquistaResponseDTO;
import br.pucgo.ads.projetointegrador.remember.service.UsuarioConquistaService;
import br.pucgo.ads.projetointegrador.remember.utils.JwtClaimsUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/remember/usuario-conquistas")
public class UsuarioConquistaController {

    private final UsuarioConquistaService usuarioConquistaService;

    @Autowired
    public UsuarioConquistaController(UsuarioConquistaService usuarioConquistaService) {
        this.usuarioConquistaService = usuarioConquistaService;
    }

    /**
     * Lista todas as conquistas que um usuário específico ganhou.
     */
    @GetMapping("/{identificadorUsuario}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UsuarioConquistaResponseDTO>> listarConquistasPorUsuario(
            @RequestHeader(value = "Authorization") String authorization,
            @PathVariable Long identificadorUsuario
    ) {
        List<UsuarioConquistaResponseDTO> conquistasDoUsuario =
                usuarioConquistaService.listarConquistasPorUsuario(JwtClaimsUtils.getUserId(authorization));
        return ResponseEntity.ok(conquistasDoUsuario);
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<RankingResponseDTO>> getRanking() {
        return ResponseEntity.ok(usuarioConquistaService.buscarTop3Ranking());
    }

    /**
     * Concede uma nova conquista a um usuário.
     * Este endpoint seria chamado pelo sistema (quando uma regra é atingida) ou por um administrador.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioConquistaResponseDTO> concederConquista(
            @RequestHeader(value = "Authorization") String authorization,
            @Valid @RequestBody UsuarioConquistaRequestDTO requestDTO
    ) {
        UsuarioConquistaResponseDTO conquistaConcedida = usuarioConquistaService.concederConquista(
                JwtClaimsUtils.getUserId(authorization), requestDTO.getIdentificadorConquista());
        return ResponseEntity.status(HttpStatus.CREATED).body(conquistaConcedida);
    }
}
