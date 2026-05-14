package br.pucgo.ads.projetointegrador.diario_saude.service;

import br.pucgo.ads.projetointegrador.diario_saude.entity.RespostaQuestionarioEntity;
import br.pucgo.ads.projetointegrador.diario_saude.repository.RespostaQuestionarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RespostaQuestionarioService {

    private final RespostaQuestionarioRepository respostaRepository;

    public RespostaQuestionarioService(RespostaQuestionarioRepository respostaRepository) {
        this.respostaRepository = respostaRepository;
    }

    public List<RespostaQuestionarioEntity> buscarPorUsuario(Long platformUserId) {
        return respostaRepository.findByPlatformUserId(platformUserId);
    }

    @Transactional
    public void salvarRespostas(List<RespostaQuestionarioEntity> respostas) {
        for (RespostaQuestionarioEntity r : respostas) {
            respostaRepository
                    .findByPlatformUserIdAndPergunta(r.getPlatformUserId(), r.getPergunta())
                    .ifPresentOrElse(
                            existente -> {
                                existente.setResposta(r.getResposta());
                                existente.setPeso(r.getPeso());
                                respostaRepository.save(existente);
                            },
                            () -> respostaRepository.save(r));
        }
    }

    public int calcularPontuacaoTotal(Long platformUserId) {
        return buscarPorUsuario(platformUserId)
                .stream()
                .mapToInt(RespostaQuestionarioEntity::getPeso)
                .sum();
    }
}
