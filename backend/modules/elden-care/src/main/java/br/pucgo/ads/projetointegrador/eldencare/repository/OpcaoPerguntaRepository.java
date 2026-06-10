package br.pucgo.ads.projetointegrador.eldencare.repository;

import br.pucgo.ads.projetointegrador.eldencare.domain.ex_opcao_pergunta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OpcaoPerguntaRepository extends JpaRepository<ex_opcao_pergunta, UUID> {

    List<ex_opcao_pergunta> findByPergunta_IdOrderByOrdemAsc(UUID perguntaId);
}
