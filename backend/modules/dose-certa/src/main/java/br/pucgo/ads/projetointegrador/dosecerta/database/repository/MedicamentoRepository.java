package br.pucgo.ads.projetointegrador.dosecerta.database.repository;

import br.pucgo.ads.projetointegrador.dosecerta.database.entity.Medicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("doseCertaMedicamentoRepository")
public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {

    List<Medicamento> findByPlatformUserId(Long platformUserId);

    boolean existsByPlatformUserIdAndMedicamentoAnvisaIdAndContatarEmergenciaFalse(
            Long platformUserId, Long medicamentoAnvisaId
    );

    List<Medicamento> findByPlatformUserIdAndMedicamentoAnvisa_NomeProdutoContainingIgnoreCase(
            Long platformUserId, String nomeProduto
    );

}
