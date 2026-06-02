package br.pucgo.ads.projetointegrador.eldencare.repository;

import br.pucgo.ads.projetointegrador.eldencare.domain.ex_resposta_questionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository("eldenCareRespostaQuestionarioRepository")
public interface RespostaQuestionarioRepository extends JpaRepository<ex_resposta_questionario, UUID> {
}
