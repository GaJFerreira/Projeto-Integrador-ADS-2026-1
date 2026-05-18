package br.pucgo.ads.projetointegrador.remember.controller;

import br.pucgo.ads.projetointegrador.remember.dto.lembranca.LembrancaRequestDTO;
import br.pucgo.ads.projetointegrador.remember.dto.lembranca.LembrancaResponseDTO;
import br.pucgo.ads.projetointegrador.remember.dto.lembranca.LembrancaUpdateDTO;
import br.pucgo.ads.projetointegrador.remember.service.LembrancaService;
import br.pucgo.ads.projetointegrador.remember.utils.JwtClaimsUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/remember/lembrancas")
public class LembrancaController {

    private final LembrancaService lembrancaService;

    @Autowired
    public LembrancaController(LembrancaService lembrancaService) {
        this.lembrancaService = lembrancaService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LembrancaResponseDTO> salvarLembranca(
            @RequestHeader(value = "Authorization") String authorization,
            @Valid @RequestBody LembrancaRequestDTO requestDTO
    ) {
        requestDTO.setIdentificadorUsuario(JwtClaimsUtils.getUserId(authorization));
        LembrancaResponseDTO novaLembranca = lembrancaService.salvarLembranca(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaLembranca);
    }

    @GetMapping("/{identificador}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LembrancaResponseDTO> buscarLembrancaPorId(
            @RequestHeader(value = "Authorization") String authorization,
            @PathVariable Long identificador
    ) {
        LembrancaResponseDTO lembranca = lembrancaService.buscarLembrancaPorId(identificador, JwtClaimsUtils.getUserId(authorization));
        return ResponseEntity.ok(lembranca);
    }

    @GetMapping("/usuario/{identificadorUsuario}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LembrancaResponseDTO>> listarLembrancasPorUsuario(
            @RequestHeader(value = "Authorization") String authorization,
            @PathVariable Long identificadorUsuario
    ) {
        List<LembrancaResponseDTO> lembrancas = lembrancaService.listarLembrancasPorUsuario(JwtClaimsUtils.getUserId(authorization));
        return ResponseEntity.ok(lembrancas);
    }

    @PutMapping("/{identificador}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LembrancaResponseDTO> atualizarLembranca(
            @RequestHeader(value = "Authorization") String authorization,
            @PathVariable Long identificador,
            @Valid @RequestBody LembrancaUpdateDTO lembrancaUpdateDto
    ) {
        LembrancaResponseDTO lembrancaAtualizada = lembrancaService.atualizarLembranca(
                identificador,
                lembrancaUpdateDto,
                JwtClaimsUtils.getUserId(authorization));
        return ResponseEntity.ok(lembrancaAtualizada);
    }

    @DeleteMapping("/{identificador}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletarLembranca(
            @RequestHeader(value = "Authorization") String authorization,
            @PathVariable Long identificador
    ) {
        lembrancaService.deletarLembranca(identificador, JwtClaimsUtils.getUserId(authorization));
        return ResponseEntity.noContent().build();
    }
}
