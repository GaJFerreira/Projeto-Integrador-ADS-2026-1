package br.pucgo.ads.projetointegrador.diario_saude.controller;

import br.pucgo.ads.projetointegrador.diario_saude.dto.RespostaDTO;
import br.pucgo.ads.projetointegrador.diario_saude.dto.RespostaQuestionarioDTO;
import br.pucgo.ads.projetointegrador.diario_saude.entity.PerguntaEntity;
import br.pucgo.ads.projetointegrador.diario_saude.entity.RespostaQuestionarioEntity;
import br.pucgo.ads.projetointegrador.diario_saude.repository.PerguntaRepository;
import br.pucgo.ads.projetointegrador.diario_saude.service.RespostaQuestionarioService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/diario_saude/questionario")
public class QuestionarioRespostaController {

    private final RespostaQuestionarioService respostaService;
    private final PerguntaRepository perguntaRepository;

    public QuestionarioRespostaController(
            RespostaQuestionarioService respostaService,
            PerguntaRepository perguntaRepository) {
        this.respostaService = respostaService;
        this.perguntaRepository = perguntaRepository;
    }

    @PostMapping("/responder/{platformUserId}")
    public ResponseEntity<?> responderQuestionario(
            @PathVariable Long platformUserId,
            @RequestBody List<RespostaDTO> respostasDto) {

        List<RespostaQuestionarioEntity> respostasEntity = respostasDto.stream()
                .map(dto -> {
                    PerguntaEntity pergunta = perguntaRepository.findById(dto.getPerguntaId())
                            .orElseThrow(() -> new RuntimeException(
                                    "Pergunta não encontrada: id=" + dto.getPerguntaId()));
                    return new RespostaQuestionarioEntity(platformUserId, pergunta, dto.getResposta(), dto.getPeso());
                })
                .collect(Collectors.toList());

        respostaService.salvarRespostas(respostasEntity);

        int pontuacaoTotal = respostaService.calcularPontuacaoTotal(platformUserId);

        return ResponseEntity.ok(Map.of(
                "mensagem", "Questionário finalizado!",
                "pontuacao", pontuacaoTotal));
    }

    @GetMapping("/respostas/{platformUserId}")
    public ResponseEntity<?> obterRespostas(@PathVariable Long platformUserId) {
        List<RespostaQuestionarioEntity> respostas = respostaService.buscarPorUsuario(platformUserId);

        List<RespostaQuestionarioDTO> dto = respostas.stream()
                .map(r -> new RespostaQuestionarioDTO(
                        r.getPergunta().getId(),
                        r.getPergunta().getTexto(),
                        r.getResposta(),
                        r.getPeso()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dto);
    }
}
