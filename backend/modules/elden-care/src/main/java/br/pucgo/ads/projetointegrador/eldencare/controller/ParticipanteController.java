package br.pucgo.ads.projetointegrador.eldencare.controller;

import br.pucgo.ads.projetointegrador.eldencare.domain.ex_participante;
import br.pucgo.ads.projetointegrador.eldencare.repository.ParticipanteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/elden-care/participantes")
public class ParticipanteController {

    private final ParticipanteRepository repository;

    public ParticipanteController(ParticipanteRepository repository) {
        this.repository = repository;
    }

    // POST /api/elden-care/participantes
    // Cadastra um novo participante
    @PostMapping
    public ResponseEntity<ex_participante> criar(@RequestBody ex_participante req) {
        var salvo = repository.save(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    // GET /api/elden-care/participantes
    // Lista todos os participantes
    @GetMapping
    public ResponseEntity<List<ex_participante>> listarTodos() {
        return ResponseEntity.ok(repository.findAll());
    }

    // GET /api/elden-care/participantes/{id}
    // Busca participante por UUID
    @GetMapping("/{id}")
    public ResponseEntity<ex_participante> buscarPorId(@PathVariable UUID id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
