package br.pucgo.ads.projetointegrador.remember.service;

import br.pucgo.ads.projetointegrador.remember.domain.StatusPergunta;
import br.pucgo.ads.projetointegrador.remember.dto.Pergunta.RespostaPerguntaUsuarioRequestDTO;
import br.pucgo.ads.projetointegrador.remember.dto.Pergunta.RespostaPerguntaUsuarioResponseDTO;
import br.pucgo.ads.projetointegrador.remember.entity.PerguntaCognitiva;
import br.pucgo.ads.projetointegrador.remember.entity.RespostaPerguntaUsuario;
import br.pucgo.ads.projetointegrador.remember.exception.RecursoNaoEncontradoException;
import br.pucgo.ads.projetointegrador.remember.repository.PerguntaCognitivaRepository;
import br.pucgo.ads.projetointegrador.remember.repository.RespostaPerguntaUsuarioRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RespostaPerguntaUsuarioService {

    private final RespostaPerguntaUsuarioRepository respostaRepository;
    private final PerguntaCognitivaRepository perguntaRepository;

    @Transactional
    public RespostaPerguntaUsuarioResponseDTO salvarResposta(RespostaPerguntaUsuarioRequestDTO requestDTO) {
        Long identificadorPergunta = requestDTO.getIdentificadorPergunta();
        Long identificadorUsuario = requestDTO.getIdentificadorUsuario();

        PerguntaCognitiva pergunta = perguntaRepository.findById(identificadorPergunta)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pergunta nao encontrada com o ID: " + identificadorPergunta));

        if (!pergunta.getIdentificadorUsuario().equals(identificadorUsuario)) {
            throw new AccessDeniedException("Usuario nao autorizado a responder esta pergunta.");
        }

        if (pergunta.getStatus().equals(StatusPergunta.RESPONDIDA.getCodigo())
                || respostaRepository.existsByIdentificadorPergunta(identificadorPergunta)) {
            throw new IllegalStateException("Esta pergunta ja foi respondida.");
        }

        RespostaPerguntaUsuario novaResposta = new RespostaPerguntaUsuario();
        novaResposta.setIdentificadorPergunta(identificadorPergunta);
        novaResposta.setIdentificadorUsuario(identificadorUsuario);
        novaResposta.setTextoResposta(requestDTO.getTextoResposta());

        RespostaPerguntaUsuario respostaSalva = respostaRepository.save(novaResposta);

        pergunta.setStatus(StatusPergunta.RESPONDIDA.getCodigo());
        perguntaRepository.save(pergunta);

        return new RespostaPerguntaUsuarioResponseDTO(respostaSalva);
    }

    public List<RespostaPerguntaUsuarioResponseDTO> listarRespostasPorUsuario(Long identificadorUsuario) {
        return respostaRepository.findByIdentificadorUsuarioOrderByDataRespostaDesc(identificadorUsuario)
                .stream()
                .map(RespostaPerguntaUsuarioResponseDTO::new)
                .collect(Collectors.toList());
    }
}
