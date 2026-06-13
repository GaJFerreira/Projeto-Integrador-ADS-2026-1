package br.pucgo.ads.projetointegrador.diario_saude.controller;

import br.pucgo.ads.projetointegrador.diario_saude.entity.UsuarioMedicamentoEntity;
import br.pucgo.ads.projetointegrador.diario_saude.service.UsuarioMedicamentoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diario_saude/usuario-medicamento")
public class UsuarioMedicamentoController {

    @Autowired
    private UsuarioMedicamentoService service;

    @PostMapping("/add")
    public ResponseEntity<?> add(
            @RequestParam Long usuarioId,
            @RequestParam String nome_medicamento,
            @RequestParam(required = false) String principio_ativo,
            @RequestParam String concentracao,
            @RequestParam String via,
            @RequestParam String dosagem,
            @RequestParam String frequencia
    ) {
        return ResponseEntity.ok(service.adicionar(
                usuarioId, nome_medicamento, principio_ativo,
                concentracao, via, dosagem, frequencia));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<UsuarioMedicamentoEntity>> listar(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(service.listarPorUsuario(usuarioId));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.ok().build();
    }
}
