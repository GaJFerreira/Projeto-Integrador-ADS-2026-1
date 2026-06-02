package br.pucgo.ads.projetointegrador.eldencare.controller;

import br.pucgo.ads.projetointegrador.eldencare.dto.PlanoGeradoResponse;
import br.pucgo.ads.projetointegrador.eldencare.dto.QuestionarioApiResponse;
import br.pucgo.ads.projetointegrador.eldencare.service.PerguntaService;
import br.pucgo.ads.projetointegrador.eldencare.service.QuestionarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/elden-care/questionario")
public class QuestionarioController {

    private final QuestionarioService questionarioService;
    private final PerguntaService perguntaService;

    public QuestionarioController(QuestionarioService questionarioService,
                                  PerguntaService perguntaService) {
        this.questionarioService = questionarioService;
        this.perguntaService = perguntaService;
    }

    // GET /api/elden-care/questionario/perguntas
    // Retorna todas as perguntas agrupadas por categoria
    @GetMapping("/perguntas")
    public ResponseEntity<QuestionarioApiResponse> listarPerguntas() {
        return ResponseEntity.ok(perguntaService.listarCategorias());
    }

    // POST /api/elden-care/questionario/gerar
    // Corpo: { "participanteId": "uuid", "respostas": [...] }
    // Gera o plano de exercícios baseado nas respostas
    @PostMapping("/gerar")
    public ResponseEntity<PlanoGeradoResponse> gerarPlano(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(questionarioService.gerarPlano(payload));
    }

    // GET /api/elden-care/questionario/testar/{respostaId}
    // Testa a geração de plano a partir de uma resposta já existente (uso via Postman)
    @GetMapping("/testar/{respostaId}")
    public ResponseEntity<PlanoGeradoResponse> gerarPlanoPorResposta(@PathVariable UUID respostaId) {
        return ResponseEntity.ok(questionarioService.gerarPlanoPorResposta(respostaId));
    }
}
