package br.pucgo.ads.projetointegrador.plataforma.repository;

import br.pucgo.ads.projetointegrador.plataforma.entity.Sugestao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SugestaoRepository extends JpaRepository<Sugestao, Long> {

    List<Sugestao> findAllByOrderByCreatedAtDesc();

    List<Sugestao> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByLidaFalse();
}
