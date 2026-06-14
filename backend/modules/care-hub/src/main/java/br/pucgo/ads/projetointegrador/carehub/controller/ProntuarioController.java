package br.pucgo.ads.projetointegrador.carehub.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.pucgo.ads.projetointegrador.carehub.dto.prontuario.ProntuarioRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.prontuario.ProntuarioResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.exception.ForbiddenException;
import br.pucgo.ads.projetointegrador.carehub.service.AgendamentoService;
import br.pucgo.ads.projetointegrador.carehub.service.ProntuarioService;

import java.security.Principal;

@Slf4j
@RestController
@RequestMapping("/api/carehub/prontuarios")
public class ProntuarioController {

    @Autowired
    private ProntuarioService prontuarioService;

    @Autowired
    private AgendamentoService agendamentoService;

    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.CuidadorRepository cuidadorRepository;

    private Long obterPlatformUserIdAutenticado(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            return null;
        }

        String usernameOrEmail = principal.getName();

        var cuidador = cuidadorRepository.findByUsername(usernameOrEmail)
                .or(() -> cuidadorRepository.findByEmail(usernameOrEmail));
        if (cuidador.isPresent() && cuidador.get().getPlatformUserId() != null) {
            return cuidador.get().getPlatformUserId();
        }

        return null; // Neste módulo (Prontuário/Edição), apenas o Cuidador edita.
    }

    @PostMapping
    public ResponseEntity<ProntuarioResponseDTO> criarProntuario(
            @Valid @RequestBody ProntuarioRequestDTO dto
    ) {
        log.info("[ProntuarioController] POST /api/carehub/prontuarios - clienteId={}", dto.getClienteId());
        ProntuarioResponseDTO prontuario = prontuarioService.criarProntuario(dto);
        return ResponseEntity.ok(prontuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProntuarioResponseDTO> atualizarProntuario(
            @PathVariable Long id,
            Principal principal,
            @Valid @RequestBody ProntuarioRequestDTO dto
    ) {
        if (principal == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        Long cuidadorPlatformId = obterPlatformUserIdAutenticado(principal);
        if (cuidadorPlatformId == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Usuário platformUserId não encontrado ou não é cuidador");
        }
        
        // Buscar prontuário para obter o clienteId
        ProntuarioResponseDTO prontuarioAtual = prontuarioService.buscarPorId(id);
        if (prontuarioAtual == null) {
            return ResponseEntity.notFound().build();
        }
        Long clienteId = prontuarioAtual.getClienteId();
        
        // Validar se cuidador pode editar prontuário hoje
        if (!agendamentoService.podeEditarProntuario(cuidadorPlatformId, clienteId)) {
            throw new ForbiddenException(
                "Você só pode editar prontuários durante atendimentos agendados para hoje"
            );
        }
        
        ProntuarioResponseDTO prontuario = prontuarioService.atualizarProntuario(id, dto);
        return ResponseEntity.ok(prontuario);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProntuarioResponseDTO> buscarPorId(@PathVariable Long id) {
        ProntuarioResponseDTO prontuario = prontuarioService.buscarPorId(id);
        if (prontuario == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(prontuario);
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<ProntuarioResponseDTO> buscarPorCliente(@PathVariable Long clienteId) {
        log.info("[ProntuarioController] GET /api/carehub/prontuarios/cliente/{}", clienteId);
        ProntuarioResponseDTO prontuario = prontuarioService.buscarPorClienteId(clienteId);
        if (prontuario == null) {
            log.warn("[ProntuarioController] Nenhum prontuário encontrado para clienteId={}. Retornando 204.", clienteId);
            return ResponseEntity.noContent().build();
        }
        log.info("[ProntuarioController] Prontuário encontrado id={} para clienteId={}", prontuario.getId(), clienteId);
        return ResponseEntity.ok(prontuario);
    }

    @GetMapping("/pode-editar/{clienteId}")
    public ResponseEntity<Boolean> verificarPodeEditar(
            @PathVariable Long clienteId,
            Principal principal
    ) {
        if (principal == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        Long cuidadorPlatformId = obterPlatformUserIdAutenticado(principal);
        if (cuidadorPlatformId == null) {
            return ResponseEntity.ok(false);
        }
        boolean podeEditar = agendamentoService.podeEditarProntuario(cuidadorPlatformId, clienteId);
        log.info("[ProntuarioController] podeEditar: cuidadorPlatformId={}, clienteId={}, resultado={}",
                cuidadorPlatformId, clienteId, podeEditar);
        return ResponseEntity.ok(podeEditar);
    }
}
