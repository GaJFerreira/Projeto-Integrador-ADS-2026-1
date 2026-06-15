package br.pucgo.ads.projetointegrador.plataforma.controller;

import br.pucgo.ads.projetointegrador.plataforma.dto.SugestaoRequestDto;
import br.pucgo.ads.projetointegrador.plataforma.dto.SugestaoResponseDto;
import br.pucgo.ads.projetointegrador.plataforma.security.CustomUserDetails;
import br.pucgo.ads.projetointegrador.plataforma.service.SugestaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sugestoes")
@RequiredArgsConstructor
public class SugestaoController {

    private final SugestaoService sugestaoService;

    /**
     * Usuário autenticado envia uma sugestão/dúvida/contato.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SugestaoResponseDto> enviar(
            @RequestBody SugestaoRequestDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        SugestaoResponseDto response = sugestaoService.enviar(
                dto,
                userDetails.getId(),
                userDetails.getUser().getName(),
                userDetails.getUser().getEmail()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Usuário vê seu próprio histórico de sugestões enviadas.
     */
    @GetMapping("/minhas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SugestaoResponseDto>> minhas(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(sugestaoService.listarPorUsuario(userDetails.getId()));
    }

    /**
     * Admin: lista todas as sugestões recebidas.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SugestaoResponseDto>> listarTodas() {
        return ResponseEntity.ok(sugestaoService.listarTodas());
    }

    /**
     * Admin: conta quantas sugestões não foram lidas (para badge de notificação).
     */
    @GetMapping("/nao-lidas/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> contarNaoLidas() {
        return ResponseEntity.ok(Map.of("count", sugestaoService.contarNaoLidas()));
    }

    /**
     * Admin: marca uma sugestão como lida.
     */
    @PatchMapping("/{id}/lida")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SugestaoResponseDto> marcarComoLida(@PathVariable Long id) {
        return ResponseEntity.ok(sugestaoService.marcarComoLida(id));
    }

    /**
     * Admin: deleta uma sugestão.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        sugestaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
