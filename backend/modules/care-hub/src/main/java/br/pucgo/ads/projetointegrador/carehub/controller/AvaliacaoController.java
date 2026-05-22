package br.pucgo.ads.projetointegrador.carehub.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.pucgo.ads.projetointegrador.carehub.dto.avaliacao.AvaliacaoRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.avaliacao.AvaliacaoResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.service.AvaliacaoService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/carehub/avaliacoes")
public class AvaliacaoController {

    @Autowired
    private AvaliacaoService avaliacaoService;

    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.CuidadorRepository cuidadorRepository;

    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.ClienteRepository clienteRepository;

    private Long obterIdLocal(Long platformUserId) {
        if (platformUserId == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "X-User-Id header é obrigatório");
        }
        var c = cuidadorRepository.findByPlatformUserId(platformUserId);
        if (c.isPresent()) return c.get().getId();
        
        var cli = clienteRepository.findByPlatformUserId(platformUserId);
        if (cli.isPresent()) return cli.get().getId();
        
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, 
                "Usuário local do CareHub não encontrado para o platformUserId: " + platformUserId);
    }

    @PostMapping
    public ResponseEntity<AvaliacaoResponseDTO> criarAvaliacao(
            @RequestHeader("X-User-Id") Long clienteId,
            @Valid @RequestBody AvaliacaoRequestDTO dto
    ) {
        Long localClienteId = obterIdLocal(clienteId);
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
