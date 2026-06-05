package br.pucgo.ads.projetointegrador.dosecerta.controller;

import br.pucgo.ads.projetointegrador.dosecerta.config.JwtUtil;
import br.pucgo.ads.projetointegrador.dosecerta.dto.MedicamentoCreateDTO;
import br.pucgo.ads.projetointegrador.dosecerta.dto.MedicamentoCriadoDTO;
import br.pucgo.ads.projetointegrador.dosecerta.dto.MedicamentoResponseDTO;
import br.pucgo.ads.projetointegrador.dosecerta.dto.MedicamentoUpdateDTO;
import br.pucgo.ads.projetointegrador.dosecerta.database.entity.Medicamento;
import br.pucgo.ads.projetointegrador.dosecerta.service.MedicamentoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController("doseCertaMedicamentoController")
@RequestMapping("api/dose-certa/medicamentos")

public class DoseCertaMedicamentoController {

    private final MedicamentoService service;
    private final JwtUtil jwtUtil;

    public DoseCertaMedicamentoController(MedicamentoService service, JwtUtil jwtUtil) {

        this.service = service;
        this.jwtUtil = jwtUtil;
    }

    // ================================================================
    // LISTAGENS
    // ================================================================
    @GetMapping
    public ResponseEntity<List<Medicamento>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }


    @GetMapping("/meus")
    public ResponseEntity<List<Medicamento>> listarMeus(HttpServletRequest request) {
        Long userId = jwtUtil.extractUserId(request);
        return ResponseEntity.ok(service.listarPorUsuario(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicamentoResponseDTO> detalhar(@PathVariable Long id) {
        return ResponseEntity.ok(service.detalharMedicamento(id));
    }

    @GetMapping("/detalhes")
    public ResponseEntity<List<MedicamentoResponseDTO>> listarMeusDetalhado(HttpServletRequest request) {
        Long userId = jwtUtil.extractUserId(request);
        return ResponseEntity.ok(service.listarPorUsuarioComDetalhes(userId));
    }


    // ================================================================
    // CRIAR
    // ================================================================
    @PostMapping
    public ResponseEntity<MedicamentoCriadoDTO> criar(
            @RequestBody MedicamentoCreateDTO dto,
            @RequestParam Long anvisaId,
            HttpServletRequest request
    ) {
        Long userId = jwtUtil.extractUserId(request);
        Medicamento salvo = service.salvarFromDTO(dto, anvisaId, userId);

        return ResponseEntity.ok(
                new MedicamentoCriadoDTO(
                        salvo.getId(),
                        salvo.getMedicamentoAnvisa().getNomeProduto(),
                        salvo.getTarja().name()
                )
        );
    }


    // ================================================================
    // ATUALIZAR  (USANDO MedicamentoUpdateDTO)
    // ================================================================
    @PutMapping("/{id}")
    public ResponseEntity<MedicamentoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody MedicamentoUpdateDTO dto
    ) {
        return ResponseEntity.ok(service.atualizarFromDTO(id, dto));
    }


    // ================================================================
    // DELETAR
    // ================================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
