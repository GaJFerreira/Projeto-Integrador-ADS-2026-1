package br.pucgo.ads.projetointegrador.remember.controller;

import br.pucgo.ads.projetointegrador.remember.dto.Pergunta.RespostaPerguntaUsuarioRequestDTO;
import br.pucgo.ads.projetointegrador.remember.dto.Pergunta.RespostaPerguntaUsuarioResponseDTO;
import br.pucgo.ads.projetointegrador.remember.service.RespostaPerguntaUsuarioService;
import br.pucgo.ads.projetointegrador.remember.utils.JwtClaimsUtils;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/remember/respostas-perguntas")
@RequiredArgsConstructor
public class RespostaPerguntaUsuarioController {

    private final RespostaPerguntaUsuarioService respostaService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespostaPerguntaUsuarioResponseDTO> salvarResposta(
            @RequestHeader(value = "Authorization") String authorization,
            @Valid @RequestBody RespostaPerguntaUsuarioRequestDTO requestDTO
    ) {
        try {
            requestDTO.setIdentificadorUsuario(JwtClaimsUtils.getUserId(authorization));
            RespostaPerguntaUsuarioResponseDTO respostaSalva = respostaService.salvarResposta(requestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(respostaSalva);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RespostaPerguntaUsuarioResponseDTO>> listarRespostas(
            @RequestHeader(value = "Authorization") String authorization
    ) {
        List<RespostaPerguntaUsuarioResponseDTO> respostas = respostaService.listarRespostasPorUsuario(
                JwtClaimsUtils.getUserId(authorization));
        return ResponseEntity.ok(respostas);
    }
}
