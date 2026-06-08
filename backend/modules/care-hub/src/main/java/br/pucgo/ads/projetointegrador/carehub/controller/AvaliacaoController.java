package br.pucgo.ads.projetointegrador.carehub.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.pucgo.ads.projetointegrador.carehub.dto.avaliacao.AvaliacaoRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.avaliacao.AvaliacaoResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.service.AvaliacaoService;

import java.security.Principal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/carehub/avaliacoes")
public class AvaliacaoController {

    @Autowired
    private AvaliacaoService avaliacaoService;

    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.ClienteRepository clienteRepository;

    private Long obterClienteIdAutenticado(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }

        String usernameOrEmail = principal.getName();

        // Para avaliações, quem avalia é sempre o Cliente.
        // Portanto, devemos buscar o usuário exclusivamente no clienteRepository.
        var cliente = clienteRepository.findByUsername(usernameOrEmail)
                .or(() -> clienteRepository.findByEmail(usernameOrEmail));
        if (cliente.isPresent())
            return cliente.get().getId();

        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND,
                "Cliente local do CareHub não encontrado para o principal autenticado: " + usernameOrEmail);
    }

    @PostMapping
    public ResponseEntity<AvaliacaoResponseDTO> criarAvaliacao(
            Principal principal,
            @Valid @RequestBody AvaliacaoRequestDTO dto) {
        Long localClienteId = obterClienteIdAutenticado(principal);
        log.info("Criando avaliação: clienteId={}, cuidadorId={}, nota={}",
                localClienteId, dto.getCuidadorId(), dto.getNota());

        AvaliacaoResponseDTO avaliacao = avaliacaoService.criarAvaliacao(localClienteId, dto);

        log.info("Avaliação criada com sucesso: id={}, cuidadorId={}, nota={}",
                avaliacao.getId(), avaliacao.getCuidadorId(), avaliacao.getNota());

        return ResponseEntity.ok(avaliacao);
    }

    @GetMapping("/cuidador/{cuidadorId}")
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarAvaliacoesCuidador(@PathVariable Long cuidadorId) {
        List<AvaliacaoResponseDTO> avaliacoes = avaliacaoService.listarAvaliacoesCuidador(cuidadorId);
        return ResponseEntity.ok(avaliacoes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarAvaliacao(@PathVariable Long id) {
        avaliacaoService.deletarAvaliacao(id);
        return ResponseEntity.noContent().build();
    }
}
