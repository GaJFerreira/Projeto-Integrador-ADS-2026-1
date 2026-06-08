package br.pucgo.ads.projetointegrador.remember.repository;

import br.pucgo.ads.projetointegrador.remember.entity.PerguntaCognitiva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerguntaCognitivaRepository extends JpaRepository<PerguntaCognitiva, Long> {

    List<PerguntaCognitiva> findByIdentificadorUsuarioAndStatus(Long identificadorUsuario, Integer status);

    List<PerguntaCognitiva> findByIdentificadorUsuarioOrderByDataGeracaoDesc(Long identificadorUsuario);

    List<PerguntaCognitiva> findByIdentificadorUsuarioAndStatusOrderByDataGeracaoDesc(Long identificadorUsuario, Integer status);

    Optional<PerguntaCognitiva> findFirstByIdentificadorUsuarioAndStatusOrderByDataGeracaoDesc(Long identificadorUsuario, Integer status);

    Optional<PerguntaCognitiva> findFirstByIdentificadorUsuarioOrderByDataGeracaoDesc(Long identificadorUsuario);

    @Query("SELECT p.identificadorTemplateOrigem, COUNT(p.identificadorTemplateOrigem) " +
            "FROM PerguntaCognitiva p " +
            "WHERE p.identificadorUsuario = :identificadorUsuario " +
            "GROUP BY p.identificadorTemplateOrigem")
    List<Object[]> countTemplateUsageByIdentificadorUsuario(Long identificadorUsuario);
}
