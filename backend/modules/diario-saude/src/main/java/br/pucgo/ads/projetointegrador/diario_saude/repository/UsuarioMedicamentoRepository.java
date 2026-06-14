package br.pucgo.ads.projetointegrador.diario_saude.repository;

import br.pucgo.ads.projetointegrador.diario_saude.entity.UsuarioMedicamentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsuarioMedicamentoRepository extends JpaRepository<UsuarioMedicamentoEntity, Long> {

    List<UsuarioMedicamentoEntity> findByUsuario_IdUsuario(Long usuarioId);
}
