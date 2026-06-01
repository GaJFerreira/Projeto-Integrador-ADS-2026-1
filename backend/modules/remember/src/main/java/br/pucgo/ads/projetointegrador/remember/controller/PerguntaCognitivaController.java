package br.pucgo.ads.projetointegrador.remember.controller;

import br.pucgo.ads.projetointegrador.remember.dto.Pergunta.PerguntaCognitivaResponseDTO;
import br.pucgo.ads.projetointegrador.remember.service.PerguntaCognitivaService;
import br.pucgo.ads.projetointegrador.remember.utils.JwtClaimsUtils;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/remember/perguntas-cognitivas")
@RequiredArgsConstructor
public class PerguntaCognitivaController {

    private final PerguntaCognitivaService perguntaService;

    @GetMapping("/gerar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PerguntaCognitivaResponseDTO> gerarPergunta(
            @RequestHeader(value = "Authorization") String authorization
    ) {
        return perguntaService.gerarPerguntaParaUsuario(JwtClaimsUtils.getUsuario(authorization))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PerguntaCognitivaResponseDTO>> listarPerguntas(
            @RequestHeader(value = "Authorization") String authorization,
            @RequestParam(value = "status", required = false) String status
    ) {
        List<PerguntaCognitivaResponseDTO> perguntas = perguntaService.listarPerguntasPorUsuario(
                JwtClaimsUtils.getUserId(authorization),
                status);
        return ResponseEntity.ok(perguntas);
    }
}
