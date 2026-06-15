package br.pucgo.ads.projetointegrador.dosecerta.controller;

import br.pucgo.ads.projetointegrador.dosecerta.config.JwtUtil;
import br.pucgo.ads.projetointegrador.dosecerta.dto.ContatoEmergenciaDTO;
import br.pucgo.ads.projetointegrador.dosecerta.dto.ContatoEmergenciaResponseDTO;
import br.pucgo.ads.projetointegrador.dosecerta.database.entity.ContatoEmergencia;
import br.pucgo.ads.projetointegrador.dosecerta.service.ContatoEmergenciaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController("doseCertaContatoEmergenciaController")
@RequestMapping("api/dose-certa/contatos-emergencia")
public class ContatoEmergenciaController {

    private final ContatoEmergenciaService service;
    private final JwtUtil jwtUtil;

    public ContatoEmergenciaController(ContatoEmergenciaService service, JwtUtil jwtUtil) {

        this.service = service;
        this.jwtUtil = jwtUtil;

    }

    @GetMapping("/meus")
    public List<ContatoEmergenciaResponseDTO> listarMeus(HttpServletRequest request) {
        Long userId = jwtUtil.extractUserId(request);
        return service.listarPorUsuario(userId)
                .stream()
                .map(ContatoEmergenciaResponseDTO::new)
                .toList();
    }


    @PostMapping
    public ContatoEmergenciaResponseDTO criar(
            @RequestBody ContatoEmergenciaDTO dto,
            HttpServletRequest request) {

        Long userId = jwtUtil.extractUserId(request);
        return new ContatoEmergenciaResponseDTO(service.criar(dto, userId));
    }

    // 🔹 Atualizar contato
    @PutMapping("/{id}")
    public ContatoEmergenciaResponseDTO atualizar(
            @PathVariable Long id,
            @RequestBody ContatoEmergenciaDTO dto
    ) {
        return new ContatoEmergenciaResponseDTO(service.atualizar(id, dto));
    }

    // 🔹 Excluir contato
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
