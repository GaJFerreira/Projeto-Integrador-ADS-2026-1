package br.pucgo.ads.projetointegrador.diario_saude.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.pucgo.ads.projetointegrador.diario_saude.dto.PrescricaoExameDTO;
import br.pucgo.ads.projetointegrador.diario_saude.entity.ExameEntity;
import br.pucgo.ads.projetointegrador.diario_saude.entity.PrescricaoExameEntity;
import br.pucgo.ads.projetointegrador.diario_saude.entity.PrescricaoMedicaEntity;
import br.pucgo.ads.projetointegrador.diario_saude.repository.ExameRepository;
import br.pucgo.ads.projetointegrador.diario_saude.repository.PrescricaoExameRepository;
import br.pucgo.ads.projetointegrador.diario_saude.repository.PrescricaoMedicaRepository;
import br.pucgo.ads.projetointegrador.diario_saude.service.PrescricaoExameService;

@RestController
@RequestMapping("/api/diario_saude/prescricao/exame")
public class PrescricaoExameController {

    @Autowired
    private PrescricaoExameService service;

    @Autowired
    private ExameRepository exameRepository;

    @Autowired
    private PrescricaoMedicaRepository prescricaoMedicaRepository;

    @Autowired
    private PrescricaoExameRepository prescricaoExameRepository; // ← estava faltando

    @PostMapping
    public ResponseEntity<?> save(@RequestBody PrescricaoExameDTO dto) {
        PrescricaoExameEntity entity = new PrescricaoExameEntity(dto);

        ExameEntity exame = exameRepository.findById(dto.getId_exame()).orElse(null);
        PrescricaoMedicaEntity prescricaoMedica = prescricaoMedicaRepository
                .findById(dto.getId_prescricao_medica()).orElse(null);

        if (exame == null || prescricaoMedica == null) {
            return ResponseEntity.badRequest().body("Exame ou Prescrição Médica não encontrado.");
        }

        entity.setExame(exame);
        entity.setPrescricaoMedica(prescricaoMedica);

        return ResponseEntity.ok(service.save(entity));
    }

    @GetMapping
    public ResponseEntity<List<PrescricaoExameEntity>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/prescricao/{idPrescricao}/pendentes")
    public ResponseEntity<List<PrescricaoExameEntity>> findPendentes(
            @PathVariable Long idPrescricao) {
        return ResponseEntity.ok(
                prescricaoExameRepository.findPendentesByPrescricao(idPrescricao));
    }

    // Histórico de exames já analisados
    @GetMapping("/prescricao/{idPrescricao}/analisados")
    public ResponseEntity<List<PrescricaoExameEntity>> findAnalisados(
            @PathVariable Long idPrescricao) {
        return ResponseEntity.ok(
                prescricaoExameRepository.findAnalisadosByPrescricao(idPrescricao));
    }

    @PutMapping("/{id}/resultado")
    public ResponseEntity<?> registrarResultado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        return prescricaoExameRepository.findById(id).map(exame -> {
            exame.setResultado(body.get("resultado"));
            if (body.get("data_realizacao") != null) {
                exame.setData_realizacao(LocalDate.parse(body.get("data_realizacao")));
            }
            return ResponseEntity.ok(prescricaoExameRepository.save(exame));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}