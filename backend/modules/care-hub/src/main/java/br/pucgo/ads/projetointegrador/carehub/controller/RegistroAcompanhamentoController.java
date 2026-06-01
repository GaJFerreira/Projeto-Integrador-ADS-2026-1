package br.pucgo.ads.projetointegrador.carehub.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.pucgo.ads.projetointegrador.carehub.dto.registro.RegistroAcompanhamentoRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.registro.RegistroAcompanhamentoResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.service.RegistroAcompanhamentoService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/carehub/registros")
public class RegistroAcompanhamentoController {

    @Autowired
    private RegistroAcompanhamentoService registroService;

    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.CuidadorRepository cuidadorRepository;

    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.ClienteRepository clienteRepository;

    private Long obterCuidadorIdLocal(Long cuidadorId) {
        if (cuidadorId == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "ID do cuidador é obrigatório");
        }

        return cuidadorRepository.findByPlatformUserId(cuidadorId)
                .map(br.pucgo.ads.projetointegrador.carehub.entity.Cuidador::getId)
                .or(() -> cuidadorRepository.findById(cuidadorId)
                        .map(br.pucgo.ads.projetointegrador.carehub.entity.Cuidador::getId))
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND,
                        "Cuidador local do CareHub não encontrado para o ID: " + cuidadorId));
    }

    private Long obterClienteIdLocal(Long clienteId) {
        if (clienteId == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "ID do cliente é obrigatório");
        }

        return clienteRepository.findByPlatformUserId(clienteId)
                .map(br.pucgo.ads.projetointegrador.carehub.entity.Cliente::getId)
                .or(() -> clienteRepository.findById(clienteId)
                        .map(br.pucgo.ads.projetointegrador.carehub.entity.Cliente::getId))
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND,
                        "Cliente local do CareHub não encontrado para o ID: " + clienteId));
    }

    private Long obterIdLocalAutenticado(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }

        String usernameOrEmail = principal.getName();

        var cuidador = cuidadorRepository.findByUsername(usernameOrEmail)
                .or(() -> cuidadorRepository.findByEmail(usernameOrEmail));
        if (cuidador.isPresent())
            return cuidador.get().getId();

        var cliente = clienteRepository.findByUsername(usernameOrEmail)
                .or(() -> clienteRepository.findByEmail(usernameOrEmail));
        if (cliente.isPresent())
            return cliente.get().getId();

        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND,
                "Usuário local do CareHub não encontrado para o principal autenticado: " + usernameOrEmail);
    }

    @PostMapping
    public ResponseEntity<RegistroAcompanhamentoResponseDTO> criarRegistro(
            Principal principal,
            @Valid @RequestBody RegistroAcompanhamentoRequestDTO dto) {
        Long localCuidadorId = obterIdLocalAutenticado(principal);
        RegistroAcompanhamentoResponseDTO registro = registroService.criarRegistro(localCuidadorId, dto);
        return ResponseEntity.ok(registro);
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<RegistroAcompanhamentoResponseDTO>> listarPorCliente(@PathVariable Long clienteId) {
        Long localClienteId = obterClienteIdLocal(clienteId);
        List<RegistroAcompanhamentoResponseDTO> registros = registroService.listarPorCliente(localClienteId);
        return ResponseEntity.ok(registros);
    }

    @GetMapping("/cuidador/{cuidadorId}")
    public ResponseEntity<List<RegistroAcompanhamentoResponseDTO>> listarPorCuidador(@PathVariable Long cuidadorId) {
        Long localCuidadorId = obterCuidadorIdLocal(cuidadorId);
        List<RegistroAcompanhamentoResponseDTO> registros = registroService.listarPorCuidador(localCuidadorId);
        return ResponseEntity.ok(registros);
    }

    @GetMapping("/agendamento/{agendamentoId}")
    public ResponseEntity<List<RegistroAcompanhamentoResponseDTO>> listarPorAgendamento(
            @PathVariable Long agendamentoId) {
        List<RegistroAcompanhamentoResponseDTO> registros = registroService.listarPorAgendamento(agendamentoId);
        return ResponseEntity.ok(registros);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistroAcompanhamentoResponseDTO> buscarPorId(@PathVariable Long id) {
        RegistroAcompanhamentoResponseDTO registro = registroService.buscarPorId(id);
        return ResponseEntity.ok(registro);
    }
}
