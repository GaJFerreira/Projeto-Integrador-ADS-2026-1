package br.pucgo.ads.projetointegrador.eldencare.service;

import br.pucgo.ads.projetointegrador.eldencare.domain.*;
import br.pucgo.ads.projetointegrador.eldencare.dto.PlanoGeradoResponse;
import br.pucgo.ads.projetointegrador.eldencare.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@Service
@Transactional
public class QuestionarioService {

    private final ParticipanteRepository participanteRepository;
    private final RespostaQuestionarioRepository respostaQuestionarioRepository;
    private final PlanoRepository planoRepository;
    private final DiaPlanoRepository diaPlanoRepository;
    private final ItemPlanoRepository itemPlanoRepository;
    private final ExercicioRepository exercicioRepository;
    private final RespostaUsuarioRepository respostaUsuarioRepository;
    private final PerguntaRepository perguntaRepository;
    private final PlanoService planoService;

    public QuestionarioService(ParticipanteRepository participanteRepository,
                               RespostaQuestionarioRepository respostaQuestionarioRepository,
                               PlanoRepository planoRepository,
                               DiaPlanoRepository diaPlanoRepository,
                               ItemPlanoRepository itemPlanoRepository,
                               ExercicioRepository exercicioRepository,
                               RespostaUsuarioRepository respostaUsuarioRepository,
                               PerguntaRepository perguntaRepository,
                               PlanoService planoService) {
        this.participanteRepository = participanteRepository;
        this.respostaQuestionarioRepository = respostaQuestionarioRepository;
        this.planoRepository = planoRepository;
        this.diaPlanoRepository = diaPlanoRepository;
        this.itemPlanoRepository = itemPlanoRepository;
        this.exercicioRepository = exercicioRepository;
        this.respostaUsuarioRepository = respostaUsuarioRepository;
        this.perguntaRepository = perguntaRepository;
        this.planoService = planoService;
    }

    // =========================================================================
    // ENDPOINT PRINCIPAL: POST /api/elden-care/questionario/gerar
    // Corpo esperado: { "participanteId": "uuid", "respostas": [...] }
    // =========================================================================
    public PlanoGeradoResponse gerarPlano(Map<String, Object> payload) {

        String participanteIdStr = extractString(payload.get("participanteId"));
        if (participanteIdStr == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "participanteId obrigatório");
        }

        UUID participanteId;
        try {
            participanteId = UUID.fromString(participanteIdStr);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "participanteId inválido");
        }

        ex_participante participante = participanteRepository.findById(participanteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Participante não encontrado"));

        // cabeçalho do questionário respondido
        ex_resposta_questionario respQ = new ex_resposta_questionario();
        respQ.setParticipante(participante);
        respQ.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        respQ = respostaQuestionarioRepository.save(respQ);

        // mapeia respostas e persiste
        Map<String, Object> respostasMap = extrairRespostasMap(payload);
        persistirRespostas(respostasMap, respQ);

        // calcula risco e define nível de treino
        int pontuacao = calcularPontuacao(respostasMap);
        String nivel = definirNivelTreino(pontuacao, respostasMap);

        ex_plano plano = criarPlanoSemanalBasico(participante, respQ, nivel, 3, 30);

        return planoService.montarPlanoGeradoResponse(plano.getId());
    }

    // =========================================================================
    // ENDPOINT DE TESTE: GET /api/elden-care/questionario/testar/{respostaId}
    // Gera plano a partir de uma resposta já existente
    // =========================================================================
    @Transactional(readOnly = false)
    public PlanoGeradoResponse gerarPlanoPorResposta(UUID respostaId) {

        ex_resposta_questionario respQ = respostaQuestionarioRepository.findById(respostaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Resposta de questionário não encontrada"));

        ex_participante participante = respQ.getParticipante();
        if (participante == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Resposta de questionário sem participante associado");
        }

        ex_plano plano = criarPlanoSemanalBasico(participante, respQ, "MEDIO", 3, 30);
        return planoService.montarPlanoGeradoResponse(plano.getId());
    }

    // =========================================================================
    // PERSISTÊNCIA DAS RESPOSTAS INDIVIDUAIS
    // =========================================================================

    private void persistirRespostas(Map<String, Object> respostasMap, ex_resposta_questionario respQ) {
        List<ex_resposta_usuario> registros = new ArrayList<>();

        for (Map.Entry<String, Object> entry : respostasMap.entrySet()) {
            ex_resposta_usuario ru = new ex_resposta_usuario();
            ru.setRespostaQuestionario(respQ);
            ru.setPerguntaChave(entry.getKey());

            // vincula à pergunta do banco quando disponível
            perguntaRepository.findBySlug(entry.getKey()).ifPresent(ru::setPergunta);

            Object valor = entry.getValue();
            if (valor != null) {
                String s = valor.toString().trim();
                ru.setOptionCode(s);

                try { ru.setValueNumber(Double.parseDouble(s)); }
                catch (NumberFormatException ignored) {}

                String sLower = s.toLowerCase(Locale.ROOT);
                if (sLower.equals("sim") || sLower.startsWith("sim_") || sLower.equals("true")) {
                    ru.setValueBoolean(true);
                } else if (sLower.equals("nao") || sLower.equals("não") || sLower.equals("false")) {
                    ru.setValueBoolean(false);
                }
            }

            registros.add(ru);
        }

        respostaUsuarioRepository.saveAll(registros);
    }

    // =========================================================================
    // AUXILIARES DE EXTRAÇÃO DO PAYLOAD
    // =========================================================================

    private String extractString(Object value) {
        if (value == null) return null;
        return value.toString().trim();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extrairRespostasMap(Map<String, Object> payload) {
        Object raw = payload.get("respostas");
        Map<String, Object> map = new HashMap<>();

        if (raw instanceof List<?> lista) {
            for (Object o : lista) {
                if (o instanceof Map<?, ?> entry) {
                    Object cod = entry.get("pergunta");
                    Object resp = entry.get("resposta");
                    if (cod != null) {
                        map.put(cod.toString(), resp);
                    }
                }
            }
        }
        return map;
    }

    private String getStringResposta(Map<String, Object> respostas, String chave) {
        Object valor = respostas.get(chave);
        if (valor == null) return null;
        return valor.toString().trim().toLowerCase(Locale.ROOT);
    }

    private boolean temRespostaIgual(Map<String, Object> respostas, String chave, String... valores) {
        String s = getStringResposta(respostas, chave);
        if (s == null) return false;
        for (String v : valores) {
            if (s.equals(v)) return true;
        }
        return false;
    }

    // =========================================================================
    // CÁLCULO DE PONTUAÇÃO / NÍVEL (BAIXO / MEDIO / ALTO)
    // quanto MAIOR a pontuação, MAIOR o risco → nível MAIS BAIXO
    // =========================================================================

    private int extrairIntResposta(Map<String, Object> respostas, String chave, int peso) {
        Object valor = respostas.get(chave);
        if (valor == null) return 0;

        if (valor instanceof Number n) return n.intValue() * peso;

        String s = valor.toString().trim().toLowerCase(Locale.ROOT);
        int base = switch (s) {
            case "nunca"                        -> 0;
            case "raramente"                    -> 1;
            case "às vezes", "as vezes", "as_vezes" -> 2;
            case "frequente", "sempre"          -> 3;
            case "sim", "sim_controlada", "sim_ocasional" -> 1;
            case "não", "nao"                   -> 0;
            default -> {
                if (s.contains("1a2"))          yield 1;
                else if (s.contains("2oumais")) yield 2;
                else if (s.contains("3oumais")) yield 3;
                else {
                    try { yield Integer.parseInt(s); }
                    catch (NumberFormatException e) { yield 0; }
                }
            }
        };
        return base * peso;
    }

    private boolean respostaEhSim(Map<String, Object> respostas, String chave) {
        Object valor = respostas.get(chave);
        if (valor == null) return false;
        String s = valor.toString().trim().toLowerCase(Locale.ROOT);
        return s.startsWith("sim") || s.equals("s") || s.equals("true");
    }

    private int calcularPontuacao(Map<String, Object> respostas) {
        int score = 0;

        score += extrairIntResposta(respostas, "cansaco_ativ_leves",     2);
        score += extrairIntResposta(respostas, "dor_muscular_articular", 2);
        score += extrairIntResposta(respostas, "mobilidade_geral",       2);
        score += extrairIntResposta(respostas, "equilibrio_em_um_pe",    1);
        score += extrairIntResposta(respostas, "freq_atividade_fisica",  -1); // ativo = menos risco

        if (respostaEhSim(respostas, "hipertensao"))                         score += 4;
        if (respostaEhSim(respostas, "problema_cardiaco")
         || respostaEhSim(respostas, "doenca_cardiaca"))                     score += 5;
        if (respostaEhSim(respostas, "doenca_respiratoria"))                 score += 3;
        if (respostaEhSim(respostas, "diabetes"))                            score += 2;
        if (respostaEhSim(respostas, "medico_limitou_esforco"))              score += 4;

        if (temRespostaIgual(respostas, "quedas_ultimo_ano", "1oumais"))     score += 2;
        if (temRespostaIgual(respostas, "quedas_ultimo_ano", "2oumais"))     score += 4;

        return Math.max(score, 0);
    }

    private String definirNivelTreino(int pontuacao, Map<String, Object> respostas) {
        boolean cardioImportante =
                respostaEhSim(respostas, "hipertensao") ||
                respostaEhSim(respostas, "problema_cardiaco") ||
                respostaEhSim(respostas, "doenca_cardiaca") ||
                respostaEhSim(respostas, "medico_limitou_esforco");

        boolean faltaArFrequente =
                temRespostaIgual(respostas, "falta_ar_em_esforco_leve", "frequente", "sempre");

        boolean quedasRepetidas =
                temRespostaIgual(respostas, "quedas_ultimo_ano", "2oumais");

        boolean insegurancaAoCaminhar =
                respostaEhSim(respostas, "inseguranca_ao_caminhar") ||
                temRespostaIgual(respostas, "consegue_levantar_sem_apoio", "nao_consegue");

        int riscoExtra = 0;
        if (cardioImportante)       riscoExtra += 4;
        if (faltaArFrequente)       riscoExtra += 2;
        if (quedasRepetidas)        riscoExtra += 3;
        if (insegurancaAoCaminhar)  riscoExtra += 2;

        int riscoTotal = pontuacao + riscoExtra;

        // riscoTotal >= 12 → muito frágil → treino BAIXO
        // riscoTotal  6–11 → moderado     → treino MEDIO
        // riscoTotal < 6   → baixo risco  → treino ALTO
        if (riscoTotal >= 12)   return "BAIXO";
        else if (riscoTotal >= 6) return "MEDIO";
        else                    return "ALTO";
    }

    // =========================================================================
    // CRIAÇÃO DO PLANO SEMANAL BÁSICO
    // =========================================================================

    private ex_plano criarPlanoSemanalBasico(ex_participante participante,
                                              ex_resposta_questionario respQ,
                                              String nivel,
                                              int freqSemana,
                                              int tempoSessaoMin) {
        ex_plano plano = new ex_plano();
        plano.setParticipante(participante);
        plano.setMes(LocalDate.now().withDayOfMonth(1));
        plano.setObjetivo("Melhorar condicionamento");
        plano.setNivel(nivel);
        plano.setFreqSemana(freqSemana);
        plano.setTempoSessaoMin(tempoSessaoMin);
        plano = planoRepository.save(plano);

        // cria 3 dias fixos
        ex_dia_plano seg = criarDia(plano, "SEGUNDA-FEIRA");
        ex_dia_plano qua = criarDia(plano, "QUARTA-FEIRA");
        ex_dia_plano sex = criarDia(plano, "SEXTA-FEIRA");

        List<ex_item_plano> itens = montarItensPorNivel(nivel, seg, qua, sex);
        itemPlanoRepository.saveAll(itens);

        return plano;
    }

    private ex_dia_plano criarDia(ex_plano plano, String titulo) {
        ex_dia_plano dia = new ex_dia_plano();
        dia.setPlano(plano);
        dia.setDataOuOrdem(titulo);
        return diaPlanoRepository.save(dia);
    }

    private List<ex_item_plano> montarItensPorNivel(String nivel,
                                                     ex_dia_plano seg,
                                                     ex_dia_plano qua,
                                                     ex_dia_plano sex) {
        ex_exercicio caminhadaLeve    = obterOuCriar("Caminhada ao ar livre",                        30);
        ex_exercicio dancaLeve        = obterOuCriar("Dança leve/ritmada",                          30);
        ex_exercicio mobilidade       = obterOuCriar("Mobilidade de quadril/tornozelo",              30);
        ex_exercicio alongamento      = obterOuCriar("Alongamentos suaves (sentado)",               20);
        ex_exercicio fortalecimento   = obterOuCriar("Fortalecimento de membros inferiores (cadeira)", 20);

        List<ex_item_plano> itens = new ArrayList<>();
        switch (nivel) {
            case "ALTO" -> {
                itens.add(criarItem(seg, caminhadaLeve,  1));
                itens.add(criarItem(qua, dancaLeve,       1));
                itens.add(criarItem(sex, fortalecimento,  1));
            }
            case "MEDIO" -> {
                itens.add(criarItem(seg, caminhadaLeve,  1));
                itens.add(criarItem(qua, mobilidade,      1));
                itens.add(criarItem(sex, dancaLeve,       1));
            }
            default -> { // BAIXO
                itens.add(criarItem(seg, caminhadaLeve,  1));
                itens.add(criarItem(qua, alongamento,     1));
                itens.add(criarItem(sex, mobilidade,      1));
            }
        }
        return itens;
    }

    private ex_exercicio obterOuCriar(String nome, int tempoMedioMin) {
        return exercicioRepository.findByNomeIgnoreCase(nome).orElseGet(() -> {
            ex_exercicio ex = new ex_exercicio();
            ex.setNome(nome);
            ex.setTempoMedioMin(tempoMedioMin);
            return exercicioRepository.save(ex);
        });
    }

    private ex_item_plano criarItem(ex_dia_plano dia, ex_exercicio exercicio, int ordem) {
        ex_item_plano item = new ex_item_plano();
        item.setDia(dia);
        item.setExercicio(exercicio);
        item.setSeries(1);
        item.setRepeticoes(null);
        item.setDuracaoSeg(
                exercicio.getTempoMedioMin() != null ? exercicio.getTempoMedioMin() * 60 : null
        );
        item.setOrdem(ordem);
        return item;
    }
}
