package br.pucgo.ads.projetointegrador.diario_saude.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import br.pucgo.ads.projetointegrador.diario_saude.entity.PrescricaoExameEntity;

public interface PrescricaoExameRepository extends JpaRepository<PrescricaoExameEntity, Long> {

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
                AND e.resultado IS NOT NULL AND e.resultado != ''
                AND e.data_realizacao IS NOT NULL
                ORDER BY e.data_realizacao DESC
            """)
    List<PrescricaoExameEntity> findAnalisadosByPrescricao(@Param("idPrescricao") Long idPrescricao);

    // Por usuário — pendentes (sem resultado)
    @Query("""
                SELECT e FROM PrescricaoExameEntity e
                WHERE e.prescricaoMedica.usuario.idUsuario = :idUsuario
                AND (e.resultado IS NULL OR e.resultado = '')
                AND e.data_realizacao IS NULL
                ORDER BY e.data_prescricao ASC
            """)
    List<PrescricaoExameEntity> findPendentesByUsuario(@Param("idUsuario") Long idUsuario);

    // Por usuário — todos (pendentes + analisados)
    @Query("""
                SELECT e FROM PrescricaoExameEntity e
                WHERE e.prescricaoMedica.usuario.idUsuario = :idUsuario
                ORDER BY e.data_prescricao DESC
            """)
    List<PrescricaoExameEntity> findAllByUsuario(@Param("idUsuario") Long idUsuario);
}