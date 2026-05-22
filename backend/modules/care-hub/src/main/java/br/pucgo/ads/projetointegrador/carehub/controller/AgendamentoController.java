package br.pucgo.ads.projetointegrador.carehub.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.pucgo.ads.projetointegrador.carehub.dto.agendamento.AgendamentoRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.agendamento.AgendamentoResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.service.AgendamentoService;

import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.security.access.AccessDeniedException;

@Slf4j
@RestController
@RequestMapping("/api/carehub/agendamentos")
public class AgendamentoController {

    @Autowired
    private AgendamentoService agendamentoService;

    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.CuidadorRepository cuidadorRepository;

    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.ClienteRepository clienteRepository;

    private Long obterIdLocal(Long platformUserId) {
        if (platformUserId == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "User ID é obrigatório");
        }
        
        var c = cuidadorRepository.findByPlatformUserId(platformUserId);
        if (c.isPresent()) return c.get().getId();
        
        var cli = clienteRepository.findByPlatformUserId(platformUserId);
        if (cli.isPresent()) return cli.get().getId();
        
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, 
                "UsuÃ¡rio local do CareHub nÃ£o encontrado para o platformUserId: " + platformUserId);
    }

    private Long obterIdLocalOuNull(Long platformUserId) {
        try {
            return obterIdLocal(platformUserId);
        } catch (org.springframework.web.server.ResponseStatusException ex) {
            if (ex.getStatusCode() == org.springframework.http.HttpStatus.NOT_FOUND) {
                return null;
            }
            throw ex;
        }
    }

    private String getUsername(Principal principal) {
        if (principal == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "UsuÃ¡rio nÃ£o autenticado");
        }
        return principal.getName();
    }

    @PostMapping
    public ResponseEntity<AgendamentoResponseDTO> criarAgendamento(
            @Valid @RequestBody AgendamentoRequestDTO dto
    ) {
        log.info("Criando agendamento: clienteId={}, cuidadorId={}, data={}", 
            dto.getClienteId(), dto.getCuidadorId(), dto.getDataHoraInicio());
        
        // Resolve platform user id to local id for client
        Long localClienteId = obterIdLocal(dto.getClienteId());
        dto.setClienteId(localClienteId);
        
        AgendamentoResponseDTO agendamento = agendamentoService.criarAgendamento(dto);
        
        log.info("Agendamento criado com sucesso: id={}, status={}", 
            agendamento.getId(), agendamento.getStatus());
        
        return ResponseEntity.ok(agendamento);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AgendamentoResponseDTO> atualizarStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal
    ) {
        log.info("Atualizando status do agendamento: id={}, novoStatus={} (actor={})", id, status, principal == null ? "anonymous" : principal.getName());

        AgendamentoResponseDTO agendamento = agendamentoService.atualizarStatus(id, status, principal);

        log.info("Status atualizado com sucesso: id={}, status={}", id, agendamento.getStatus());

        return ResponseEntity.ok(agendamento);
    }

    @PostMapping("/{id}/contraproposta")
    public ResponseEntity<AgendamentoResponseDTO> proporContraproposta(
            @PathVariable Long id,
            @RequestBody br.pucgo.ads.projetointegrador.carehub.dto.agendamento.ContrapropostaRequestDTO dto,
            Principal principal
    ) {
        log.info("Cuidador propondo contraproposta: agendamentoId={}, actor={} - inicio={}, fim={}", id, principal == null ? "anonymous" : principal.getName(), dto.getDataHoraInicio(), dto.getDataHoraFim());
        AgendamentoResponseDTO agendamento = agendamentoService.proporContraproposta(id, dto, principal);
        return ResponseEntity.ok(agendamento);
    }

    @GetMapping("/cuidador/{cuidadorId}")
    public ResponseEntity<List<AgendamentoResponseDTO>> listarPorCuidador(@PathVariable Long cuidadorId) {
        Long localCuidadorId = obterIdLocalOuNull(cuidadorId);
        if (localCuidadorId == null) {
            return ResponseEntity.ok(List.of());
        }
        List<AgendamentoResponseDTO> agendamentos = agendamentoService.listarPorCuidador(localCuidadorId);
        return ResponseEntity.ok(agendamentos);
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<AgendamentoResponseDTO>> listarPorCliente(@PathVariable Long clienteId) {
        Long localClienteId = obterIdLocalOuNull(clienteId);
        if (localClienteId == null) {
            return ResponseEntity.ok(List.of());
        }
        List<AgendamentoResponseDTO> agendamentos = agendamentoService.listarPorCliente(localClienteId);
        return ResponseEntity.ok(agendamentos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgendamentoResponseDTO> buscarPorId(@PathVariable Long id) {
        AgendamentoResponseDTO agendamento = agendamentoService.buscarPorId(id);
        return ResponseEntity.ok(agendamento);
    }

    @GetMapping("/cuidador/{cuidadorId}/periodo")
    public ResponseEntity<List<AgendamentoResponseDTO>> listarPorCuidadorEPeriodo(
            @PathVariable Long cuidadorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fim
    ) {
        Long localCuidadorId = obterIdLocalOuNull(cuidadorId);
        if (localCuidadorId == null) {
            return ResponseEntity.ok(List.of());
        }
        List<AgendamentoResponseDTO> agendamentos = agendamentoService.listarPorCuidadorEPeriodo(localCuidadorId, inicio, fim);
        return ResponseEntity.ok(agendamentos);
    }

    private Long obterUserIdSeguro(String usernameOrEmail) {
        try {
            return agendamentoService.getUserIdByUsernameOrEmail(usernameOrEmail);
        } catch (Exception e) {
            log.warn("UsuÃ¡rio nÃ£o cadastrado no mÃ³dulo CareHub (pode ser admin): {}", usernameOrEmail);
            return null;
        }
    }

    @GetMapping("/proximos")
    public ResponseEntity<List<AgendamentoResponseDTO>> listarProximos(
            Principal principal,
            @RequestParam(defaultValue = "7") int dias
    ) {
        // Principal.getName() retorna email ou username, nÃ£o o ID
        String usernameOrEmail = getUsername(principal);
        Long userId = obterUserIdSeguro(usernameOrEmail);
        List<AgendamentoResponseDTO> agendamentos = List.of();
        if (userId != null) {
            agendamentos = agendamentoService.listarProximos(userId, dias);
        }
        return ResponseEntity.ok(agendamentos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelarAgendamento(@PathVariable Long id) {
        agendamentoService.cancelarAgendamento(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/pode-iniciar")
    public ResponseEntity<Map<String, Object>> verificarPodeIniciar(@PathVariable Long id) {
        Map<String, Object> resultado = agendamentoService.verificarPodeIniciar(id);
        return ResponseEntity.ok(resultado);
    }
    
    @PostMapping("/{id}/aceitar-contraproposta")
    public ResponseEntity<AgendamentoResponseDTO> aceitarContraproposta(
            @PathVariable Long id,
            Principal principal
    ) {
        log.info("Cliente aceitando contraproposta: agendamentoId={}, actor={}", id, principal == null ? "anonymous" : principal.getName());
        AgendamentoResponseDTO agendamento = agendamentoService.aceitarContraproposta(id, principal);
        return ResponseEntity.ok(agendamento);
    }

    /**
     * Retorna os agendamentos concluÃ­dos que ainda nÃ£o foram avaliados (estilo Uber/99).
     * Usado para mostrar notificaÃ§Ã£o de avaliaÃ§Ã£o pendente.
     */
    @GetMapping("/avaliacoes-pendentes")
    public ResponseEntity<List<AgendamentoResponseDTO>> listarAvaliacoesPendentes(
            Principal principal
    ) {
        String usernameOrEmail = getUsername(principal);
        Long clienteId = obterUserIdSeguro(usernameOrEmail);
        log.info("Listando avaliaÃ§Ãµes pendentes: clienteId={}", clienteId);
        
        List<AgendamentoResponseDTO> pendentes = List.of();
        if (clienteId != null) {
            pendentes = agendamentoService.listarAvaliacoesPendentes(clienteId);
        }
        log.info("AvaliaÃ§Ãµes pendentes encontradas: {}", pendentes.size());
        
        return ResponseEntity.ok(pendentes);
    }

    /**
     * Conta quantos atendimentos concluÃ­dos estÃ£o pendentes de avaliaÃ§Ã£o.
     * Usado para badge de notificaÃ§Ã£o.
     */
    @GetMapping("/avaliacoes-pendentes/count")
    public ResponseEntity<Map<String, Long>> contarAvaliacoesPendentes(
            Principal principal
    ) {
        String usernameOrEmail = getUsername(principal);
        Long clienteId = obterUserIdSeguro(usernameOrEmail);
        
        long count = 0;
        if (clienteId != null) {
            count = agendamentoService.contarAvaliacoesPendentes(clienteId);
        }
        
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Conta agendamentos PENDENTES aguardando confirmaÃ§Ã£o do cuidador.
     * Usado para badge de notificaÃ§Ã£o no grid de mÃ³dulos.
     */
    @GetMapping("/pendentes-cuidador/count")
    public ResponseEntity<Map<String, Long>> contarPendentesCuidador(Principal principal) {
        String usernameOrEmail = getUsername(principal);
        Long cuidadorId = obterUserIdSeguro(usernameOrEmail);
        
        long count = 0;
        if (cuidadorId != null) {
            count = agendamentoService.contarPendentesCuidador(cuidadorId);
        }
        log.info("Agendamentos pendentes para cuidador {}: {}", cuidadorId, count);
        
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Conta agendamentos REAGENDADOS (contrapropostas) aguardando resposta do cliente.
     * Usado para badge de notificaÃ§Ã£o no grid de mÃ³dulos.
     */
    @GetMapping("/reagendados-cliente/count")
    public ResponseEntity<Map<String, Long>> contarReagendadosCliente(Principal principal) {
        String usernameOrEmail = getUsername(principal);
        Long clienteId = obterUserIdSeguro(usernameOrEmail);
        
        long count = 0;
        if (clienteId != null) {
            count = agendamentoService.contarReagendadosCliente(clienteId);
        }
        log.info("Agendamentos reagendados para cliente {}: {}", clienteId, count);
        
        return ResponseEntity.ok(Map.of("count", count));
    }
}

