package br.pucgo.ads.projetointegrador.remember.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.pucgo.ads.projetointegrador.remember.dto.Pergunta.RespostaPerguntaUsuarioRequestDTO;
import br.pucgo.ads.projetointegrador.remember.dto.Pergunta.RespostaPerguntaUsuarioResponseDTO;
import br.pucgo.ads.projetointegrador.remember.service.RespostaPerguntaUsuarioService;
import br.pucgo.ads.projetointegrador.remember.utils.JwtClaimsUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api/remember/respostas-perguntas-usuarios")
@RequiredArgsConstructor
public class RespostaPerguntaUsuarioController {

    private final RespostaPerguntaUsuarioService respostaService;

    /**
     * Envia a resposta para uma pergunta cognitiva.
     * A pergunta a ser respondida é especificada no corpo da requisição.
     */
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
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
}
