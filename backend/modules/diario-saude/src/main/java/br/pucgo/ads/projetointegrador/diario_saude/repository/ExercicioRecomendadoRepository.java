package br.pucgo.ads.projetointegrador.diario_saude.repository;

// ExercicioRecomendadoRepository.java
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import br.pucgo.ads.projetointegrador.diario_saude.entity.ExercicioRecomendadoEntity;

public interface ExercicioRecomendadoRepository extends JpaRepository<ExercicioRecomendadoEntity, Long> {

    @Query("SELECT e FROM ExercicioRecomendadoEntity e WHERE e.prescricaoMedica.id_prescricao = :idPrescricao")
    List<ExercicioRecomendadoEntity> findByPrescricaoId(@Param("idPrescricao") Long idPrescricao);
}