package br.pucgo.ads.projetointegrador.eldencare.controller;

import br.pucgo.ads.projetointegrador.eldencare.domain.ex_plano;
import br.pucgo.ads.projetointegrador.eldencare.dto.PlanoGeradoResponse;
import br.pucgo.ads.projetointegrador.eldencare.service.PlanoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/elden-care/planos")
public class PlanoController {

    private final PlanoService planoService;

    public PlanoController(PlanoService planoService) {
        this.planoService = planoService;
    }

    // GET /api/elden-care/planos/{id}
    // Retorna o plano em forma crua (entidade)
    @GetMapping("/{id}")
    public ResponseEntity<ex_plano> buscar(@PathVariable UUID id) {
        return ResponseEntity.ok(planoService.buscar(id));
    }

    // GET /api/elden-care/planos/participante/{participanteId}
    // Lista os planos de um participante
    @GetMapping("/participante/{participanteId}")
    public ResponseEntity<List<ex_plano>> listarPorParticipante(@PathVariable UUID participanteId) {
        return ResponseEntity.ok(planoService.listarPorParticipante(participanteId));
    }

    // GET /api/elden-care/planos/{id}/view
    // Retorna DTO formatado para exibição no front
    @GetMapping("/{id}/view")
    public ResponseEntity<PlanoGeradoResponse> detalharParaView(@PathVariable UUID id) {
        return ResponseEntity.ok(planoService.montarPlanoGeradoResponse(id));
    }
}
