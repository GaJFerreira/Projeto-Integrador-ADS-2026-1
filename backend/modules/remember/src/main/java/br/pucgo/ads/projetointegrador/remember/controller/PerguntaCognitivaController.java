package br.pucgo.ads.projetointegrador.remember.controller;

import br.pucgo.ads.projetointegrador.remember.dto.Pergunta.PerguntaCognitivaResponseDTO;
import br.pucgo.ads.projetointegrador.remember.service.PerguntaCognitivaService;
import br.pucgo.ads.projetointegrador.remember.utils.JwtClaimsUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/remember/perguntas-cognitivas")
@RequiredArgsConstructor
public class PerguntaCognitivaController {

    private final PerguntaCognitivaService perguntaService;

    /**
     * Busca as perguntas pendentes (não respondidas) para um usuário específico.
     * O frontend usaria o ID do usuário logado para fazer esta requisição.
     */
    @GetMapping("/pendentes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PerguntaCognitivaResponseDTO>> listarPerguntasPendentes(
            @RequestHeader(value = "Authorization") String authorization,
            @RequestParam("usuarioId") Long identificadorUsuario
    ) {
        List<PerguntaCognitivaResponseDTO> perguntas = perguntaService
                .listarPerguntasPendentesPorUsuario(JwtClaimsUtils.getUserId(authorization));
        return ResponseEntity.ok(perguntas);
    }
}
