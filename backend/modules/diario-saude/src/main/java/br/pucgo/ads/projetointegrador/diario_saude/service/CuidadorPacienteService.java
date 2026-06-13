package br.pucgo.ads.projetointegrador.diario_saude.service;

import br.pucgo.ads.projetointegrador.diario_saude.dto.UsuarioDTO;
import br.pucgo.ads.projetointegrador.diario_saude.entity.CuidadorPacienteEntity;
import br.pucgo.ads.projetointegrador.diario_saude.entity.UsuarioEntity;
import br.pucgo.ads.projetointegrador.diario_saude.repository.CuidadorPacienteRepository;
import br.pucgo.ads.projetointegrador.diario_saude.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class CuidadorPacienteService {

    @Autowired
    private CuidadorPacienteRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Vincula um cuidador a um paciente
    public CuidadorPacienteEntity vincular(Long cuidadorPlatformId, Long pacienteId) {
        if (repository.existsByCuidadorPlatformIdAndPaciente_IdUsuario(cuidadorPlatformId, pacienteId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cuidador já está vinculado a este paciente.");
        }

        UsuarioEntity paciente = usuarioRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado: id=" + pacienteId));

        return repository.save(new CuidadorPacienteEntity(cuidadorPlatformId, paciente));
    }

    // Lista todos os pacientes de um cuidador
    @Transactional
    public List<UsuarioDTO> listarPacientes(Long cuidadorPlatformId) {
        return repository.findByCuidadorPlatformId(cuidadorPlatformId)
                .stream()
                .map(cp -> {
                    UsuarioDTO dto = new UsuarioDTO(cp.getPaciente());
                    dto.setPlatformUserId(cp.getPaciente().getPlatformUserId());
                    return dto;
                })
                .toList();
    }

    // Desvincula um cuidador de um paciente
    @Transactional
    public void desvincular(Long cuidadorPlatformId, Long pacienteId) {
        repository.deleteByCuidadorPlatformIdAndPaciente_IdUsuario(cuidadorPlatformId, pacienteId);
    }

}
