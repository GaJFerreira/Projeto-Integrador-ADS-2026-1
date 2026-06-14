package br.pucgo.ads.projetointegrador.diario_saude.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.pucgo.ads.projetointegrador.diario_saude.dto.PrescricaoMedicamentoDTO;
import br.pucgo.ads.projetointegrador.diario_saude.entity.PrescricaoMedicaEntity;
import br.pucgo.ads.projetointegrador.diario_saude.entity.PrescricaoMedicamentoEntity;
import br.pucgo.ads.projetointegrador.diario_saude.repository.MedicamentoRepository;
import br.pucgo.ads.projetointegrador.diario_saude.repository.PrescricaoMedicaRepository;
import br.pucgo.ads.projetointegrador.diario_saude.repository.PrescricaoMedicamentoRepository;

@Service
public class PrescricaoMedicamentoService {

    @Autowired
    private PrescricaoMedicamentoRepository repo;

    @Autowired
    private MedicamentoRepository medicamentoRepo;

    @Autowired
    private PrescricaoMedicaRepository prescricaoRepo;

    public List<PrescricaoMedicamentoDTO> listarTodos() {
        return repo.findAll().stream()
                .map(PrescricaoMedicamentoDTO::new)
                .toList();
    }

    // Busca medicamentos da prescrição via JOIN FETCH — mesma abordagem do
    // ExercicioRecomendadoService
    @Transactional(readOnly = true)
    public List<PrescricaoMedicamentoDTO> listarPorPrescricao(Long idPrescricao) {
        PrescricaoMedicaEntity prescricao = prescricaoRepo.findByIdWithMedicamentos(idPrescricao)
                .orElseThrow(() -> new RuntimeException("Prescrição não encontrada: " + idPrescricao));
        return prescricao.getPrescricoesMedicamentos().stream()
                .map(PrescricaoMedicamentoDTO::new)
                .toList();
    }

    public void inserir(PrescricaoMedicamentoDTO dto) {
        PrescricaoMedicamentoEntity entity = new PrescricaoMedicamentoEntity();
        entity.setDosagem(dto.getDosagem());
        entity.setFrequencia(dto.getFrequencia());
        entity.setConcentracao(dto.getConcentracao());
        entity.setVia(dto.getVia());
        entity.setPrincipio_ativo(dto.getPrincipio_ativo());

        if (dto.getId_medicamento() != 0) {
            var med = medicamentoRepo.findById(dto.getId_medicamento()).orElseThrow();
            entity.setMedicamento(med);
            // usa o nome digitado se preenchido, senão usa o nome do catálogo
            entity.setNome_medicamento(dto.getNome_medicamento() != null && !dto.getNome_medicamento().isBlank()
                    ? dto.getNome_medicamento()
                    : med.getNome());
        } else {
            entity.setMedicamento(null);
            entity.setNome_medicamento(dto.getNome_medicamento());
        }

        entity.setPrescricaoMedica(prescricaoRepo.findById(dto.getId_prescricao()).orElseThrow());
        repo.save(entity);
    }

    public PrescricaoMedicamentoDTO alterar(PrescricaoMedicamentoDTO dto) {
        PrescricaoMedicamentoEntity entity = repo.findById(dto.getId_prescricao_medicamento()).orElseThrow();

        entity.setDosagem(dto.getDosagem());
        entity.setFrequencia(dto.getFrequencia());
        entity.setConcentracao(dto.getConcentracao());
        entity.setVia(dto.getVia());
        entity.setPrincipio_ativo(dto.getPrincipio_ativo());
        entity.setNome_medicamento(dto.getNome_medicamento());

        // Corrigido: não tenta buscar medicamento se id for 0
        if (dto.getId_medicamento() != 0) {
            entity.setMedicamento(medicamentoRepo.findById(dto.getId_medicamento()).orElseThrow());
        } else {
            entity.setMedicamento(null);
        }

        entity.setPrescricaoMedica(prescricaoRepo.findById(dto.getId_prescricao()).orElseThrow());
        return new PrescricaoMedicamentoDTO(repo.save(entity));
    }

    public void excluir(Long id) {
        repo.delete(repo.findById(id).orElseThrow());
    }
}