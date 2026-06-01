package br.pucgo.ads.projetointegrador.eldencare.repository;

import br.pucgo.ads.projetointegrador.eldencare.domain.ex_resposta_questionario;
import br.pucgo.ads.projetointegrador.eldencare.domain.ex_resposta_usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RespostaUsuarioRepository extends JpaRepository<ex_resposta_usuario, UUID> {

    List<ex_resposta_usuario> findByRespostaQuestionario(ex_resposta_questionario respostaQuestionario);
}
