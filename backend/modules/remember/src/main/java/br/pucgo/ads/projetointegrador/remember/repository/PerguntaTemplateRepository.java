package br.pucgo.ads.projetointegrador.remember.repository;

import br.pucgo.ads.projetointegrador.remember.entity.PerguntaTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerguntaTemplateRepository extends JpaRepository<PerguntaTemplate, Long> {

    List<PerguntaTemplate> findByAtivoTrueAndGatilhoTipo(Integer gatilhoTipo);

    List<PerguntaTemplate> findByAtivoTrue();

    Optional<PerguntaTemplate> findFirstByAtivoTrueOrderByIdentificadorPerguntaTemplateAsc();

    Optional<PerguntaTemplate> findFirstByTextoTemplate(String textoTemplate);
}
