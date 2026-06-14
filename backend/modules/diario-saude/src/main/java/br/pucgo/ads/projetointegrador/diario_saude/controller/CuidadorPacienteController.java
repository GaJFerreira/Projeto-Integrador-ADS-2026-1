package br.pucgo.ads.projetointegrador.diario_saude.controller;

import br.pucgo.ads.projetointegrador.diario_saude.dto.UsuarioDTO;
import br.pucgo.ads.projetointegrador.diario_saude.entity.CuidadorPacienteEntity;
import br.pucgo.ads.projetointegrador.diario_saude.service.CuidadorPacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diario_saude/cuidador-paciente")
@CrossOrigin(origins = "*")
public class CuidadorPacienteController {

    @Autowired
    private CuidadorPacienteService service;

    // Admin: vincula cuidador a paciente
    @PostMapping("/vincular")
    public ResponseEntity<CuidadorPacienteEntity> vincular(
            @RequestParam Long cuidadorPlatformId,
            @RequestParam Long pacienteId) {
        return ResponseEntity.ok(service.vincular(cuidadorPlatformId, pacienteId));
    }

    // Admin: desvincula cuidador de paciente
    @DeleteMapping("/desvincular")
    public ResponseEntity<Void> desvincular(
            @RequestParam Long cuidadorPlatformId,
            @RequestParam Long pacienteId) {
        service.desvincular(cuidadorPlatformId, pacienteId);
        return ResponseEntity.ok().build();
    }

    // Cuidador: lista seus pacientes
    @GetMapping("/pacientes/{cuidadorPlatformId}")
    public ResponseEntity<List<UsuarioDTO>> listarPacientes(
            @PathVariable Long cuidadorPlatformId) {
        return ResponseEntity.ok(service.listarPacientes(cuidadorPlatformId));
    }
}
