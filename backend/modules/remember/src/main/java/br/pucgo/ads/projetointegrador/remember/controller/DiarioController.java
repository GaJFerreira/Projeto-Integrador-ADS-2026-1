package br.pucgo.ads.projetointegrador.remember.controller;

import br.pucgo.ads.projetointegrador.remember.dto.diario.DiarioRequestDTO;
import br.pucgo.ads.projetointegrador.remember.dto.diario.DiarioResponseDTO;
import br.pucgo.ads.projetointegrador.remember.dto.diario.DiarioUpdateDTO;
import br.pucgo.ads.projetointegrador.remember.service.DiarioService;
import br.pucgo.ads.projetointegrador.remember.utils.JwtClaimsUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/remember/diarios")
public class DiarioController {

    private final DiarioService diarioService;

    @Autowired
    public DiarioController(DiarioService diarioService) {
        this.diarioService = diarioService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DiarioResponseDTO> salvarDiario(
            @RequestHeader(value = "Authorization") String authorization,
            @Valid @RequestBody DiarioRequestDTO requestDTO
    ) {
        requestDTO.setIdentificadorUsuario(JwtClaimsUtils.getUserId(authorization));
        DiarioResponseDTO novoDiario = diarioService.salvarDiario(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoDiario);
    }

    @GetMapping("/{identificador}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DiarioResponseDTO> buscarDiarioPorId(
            @RequestHeader(value = "Authorization") String authorization,
            @PathVariable Long identificador
    ) {
        DiarioResponseDTO diario = diarioService.buscarDiarioPorId(identificador, JwtClaimsUtils.getUserId(authorization));
        return ResponseEntity.ok(diario);
    }

    @GetMapping("/usuario/{identificadorUsuario}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DiarioResponseDTO>> listarDiariosPorUsuario(
            @RequestHeader(value = "Authorization") String authorization,
            @PathVariable Long identificadorUsuario
    ) {
        List<DiarioResponseDTO> diarios = diarioService.listarDiariosPorUsuario(JwtClaimsUtils.getUserId(authorization));
        return ResponseEntity.ok(diarios);
    }

    @PutMapping("/{identificador}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DiarioResponseDTO> atualizarDiario(
            @RequestHeader(value = "Authorization") String authorization,
            @PathVariable Long identificador,
            @Valid @RequestBody DiarioUpdateDTO diarioUpdateDto
    ) {
        DiarioResponseDTO diarioAtualizado = diarioService.atualizarDiario(
                identificador,
                diarioUpdateDto,
                JwtClaimsUtils.getUserId(authorization));
        return ResponseEntity.ok(diarioAtualizado);
    }

    @DeleteMapping("/{identificador}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletarDiario(
            @RequestHeader(value = "Authorization") String authorization,
            @PathVariable Long identificador
    ) {
        diarioService.deletarDiario(identificador, JwtClaimsUtils.getUserId(authorization));
        return ResponseEntity.noContent().build();
    }
}
