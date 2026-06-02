package br.pucgo.ads.projetointegrador.eldencare.repository;

import br.pucgo.ads.projetointegrador.eldencare.domain.ex_pergunta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository("eldenCarePerguntaRepository")
public interface PerguntaRepository extends JpaRepository<ex_pergunta, UUID> {

    Optional<ex_pergunta> findBySlug(String slug);

    List<ex_pergunta> findAllBySlugIsNotNullOrderByOrdem();

    long countBySlugIsNotNull();
}
