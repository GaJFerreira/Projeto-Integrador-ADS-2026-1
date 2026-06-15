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

        var cliente = clienteRepository.findByUsername(usernameOrEmail)
                .or(() -> clienteRepository.findByEmail(usernameOrEmail));
        if (cliente.isPresent() && cliente.get().getPlatformUserId() != null) {
            return cliente.get().getPlatformUserId();
        }

        return null;
    }

    @PostMapping
    public ResponseEntity<RegistroAcompanhamentoResponseDTO> criarRegistro(
            Principal principal,
            @Valid @RequestBody RegistroAcompanhamentoRequestDTO dto) {
        Long platformUserId = obterPlatformUserIdAutenticado(principal);
        if (platformUserId == null) return ResponseEntity.badRequest().build();
        RegistroAcompanhamentoResponseDTO registro = registroService.criarRegistro(platformUserId, dto);
        return ResponseEntity.ok(registro);
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<RegistroAcompanhamentoResponseDTO>> listarPorCliente(@PathVariable Long clienteId) {
        List<RegistroAcompanhamentoResponseDTO> registros = registroService.listarPorCliente(clienteId);
        return ResponseEntity.ok(registros);
    }

    @GetMapping("/cuidador/{cuidadorId}")
    public ResponseEntity<List<RegistroAcompanhamentoResponseDTO>> listarPorCuidador(@PathVariable Long cuidadorId) {
        List<RegistroAcompanhamentoResponseDTO> registros = registroService.listarPorCuidador(cuidadorId);
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
