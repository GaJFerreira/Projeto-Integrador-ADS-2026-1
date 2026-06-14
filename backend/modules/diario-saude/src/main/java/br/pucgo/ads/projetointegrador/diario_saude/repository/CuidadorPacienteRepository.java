package br.pucgo.ads.projetointegrador.diario_saude.repository;

import br.pucgo.ads.projetointegrador.diario_saude.entity.CuidadorPacienteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CuidadorPacienteRepository extends JpaRepository<CuidadorPacienteEntity, Long> {

    List<CuidadorPacienteEntity> findByCuidadorPlatformId(Long cuidadorPlatformId);

    Optional<CuidadorPacienteEntity> findByCuidadorPlatformIdAndPaciente_IdUsuario(Long cuidadorPlatformId, Long pacienteId);

    boolean existsByCuidadorPlatformIdAndPaciente_IdUsuario(Long cuidadorPlatformId, Long pacienteId);

    void deleteByCuidadorPlatformIdAndPaciente_IdUsuario(Long cuidadorPlatformId, Long pacienteId);
}
