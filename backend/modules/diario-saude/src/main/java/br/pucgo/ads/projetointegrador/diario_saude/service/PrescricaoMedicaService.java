package br.pucgo.ads.projetointegrador.diario_saude.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.pucgo.ads.projetointegrador.diario_saude.dto.PrescricaoMedicaDTO;
import br.pucgo.ads.projetointegrador.diario_saude.entity.PrescricaoMedicaEntity;
import br.pucgo.ads.projetointegrador.diario_saude.entity.UsuarioEntity;
import br.pucgo.ads.projetointegrador.diario_saude.repository.PrescricaoMedicaRepository;

@Service
public class PrescricaoMedicaService {

    @Autowired
    private PrescricaoMedicaRepository repo;

    @Autowired
    private UsuarioService usuarioService;

    public List<PrescricaoMedicaDTO> listarTodos() {
        return repo.findAll().stream().map(PrescricaoMedicaDTO::new).toList();
    }

    public PrescricaoMedicaDTO inserir(PrescricaoMedicaDTO dto) {
        PrescricaoMedicaEntity entity = new PrescricaoMedicaEntity(dto);

        // Armazena apenas o ID do médico da plataforma
        entity.setMedicoId(dto.getId_medico());

        // Busca ou cria o paciente no módulo diario-saude
        UsuarioEntity paciente = usuarioService.buscarOuCriarPaciente(dto.getId_usuario(), null);
        entity.setUsuario(paciente);

        entity.setData_prescricao(LocalDate.now().toString());

        return new PrescricaoMedicaDTO(repo.save(entity));
    }

    public PrescricaoMedicaDTO alterar(PrescricaoMedicaDTO dto) {
        return inserir(dto);
    }

    public void excluir(Long id) {
        repo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<PrescricaoMedicaDTO> listarPorUsuario(Long idUsuario) {
        return repo.findByUsuario(idUsuario).stream().map(PrescricaoMedicaDTO::new).toList();
    }
}
