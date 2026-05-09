package br.pucgo.ads.projetointegrador.diario_saude.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import br.pucgo.ads.projetointegrador.diario_saude.entity.PrescricaoExameEntity;

public interface PrescricaoExameRepository extends JpaRepository<PrescricaoExameEntity, Long> {

    // Todos os exames de uma prescrição (mantido para uso geral)
    @Query("SELECT e FROM PrescricaoExameEntity e WHERE e.prescricaoMedica.id_prescricao = :idPrescricao")
    List<PrescricaoExameEntity> findByPrescricao(@Param("idPrescricao") Long idPrescricao);

    @Query("""
                SELECT e FROM PrescricaoExameEntity e
                WHERE e.prescricaoMedica.id_prescricao = :idPrescricao
                AND (e.resultado IS NULL OR e.resultado = '')
                AND e.data_realizacao IS NULL
                ORDER BY e.data_prescricao ASC
            """)
    List<PrescricaoExameEntity> findPendentesByPrescricao(@Param("idPrescricao") Long idPrescricao);

    @Query("""
                SELECT e FROM PrescricaoExameEntity e
                WHERE e.prescricaoMedica.id_prescricao = :idPrescricao
                AND e.resultado IS NOT NULL
                AND e.resultado != ''
                AND e.data_realizacao IS NOT NULL
                ORDER BY e.data_realizacao DESC
            """)
    List<PrescricaoExameEntity> findAnalisadosByPrescricao(@Param("idPrescricao") Long idPrescricao);
}