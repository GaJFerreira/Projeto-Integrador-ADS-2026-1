package br.pucgo.ads.projetointegrador.eldencare.service;

import br.pucgo.ads.projetointegrador.eldencare.domain.ex_exercicio;
import br.pucgo.ads.projetointegrador.eldencare.domain.ex_opcao_pergunta;
import br.pucgo.ads.projetointegrador.eldencare.domain.ex_pergunta;
import br.pucgo.ads.projetointegrador.eldencare.repository.ExercicioRepository;
import br.pucgo.ads.projetointegrador.eldencare.repository.OpcaoPerguntaRepository;
import br.pucgo.ads.projetointegrador.eldencare.repository.PerguntaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Popula ex_pergunta, ex_opcao_pergunta e ex_exercicio no startup caso as tabelas estejam vazias.
 * Operação idempotente — não repete se os dados já existem.
 */
@Component("eldenCareDataSeeder")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final PerguntaRepository perguntaRepository;
    private final OpcaoPerguntaRepository opcaoPerguntaRepository;
    private final ExercicioRepository exercicioRepository;

    public DataSeeder(PerguntaRepository perguntaRepository,
                      OpcaoPerguntaRepository opcaoPerguntaRepository,
                      ExercicioRepository exercicioRepository) {
        this.perguntaRepository      = perguntaRepository;
        this.opcaoPerguntaRepository = opcaoPerguntaRepository;
        this.exercicioRepository     = exercicioRepository;
    }

    // -------------------------------------------------------------------------
    // Estruturas internas de dados
    // -------------------------------------------------------------------------
    record Opc(String codigo, String rotulo) {}

    record Pergunta(String slug, String enunciado, String categoria, int ordem, Opc... opcoes) {}

    // -------------------------------------------------------------------------
    // 40 perguntas — 8 categorias, 5 por categoria
    // -------------------------------------------------------------------------
    private static final List<Pergunta> PERGUNTAS = List.of(

        // ── CONDIÇÃO FÍSICA ──────────────────────────────────────────────────
        new Pergunta("cansaco_ativ_leves",       "Você sente cansaço em atividades leves?",            "condicao", 1,
            new Opc("nunca","Nunca"), new Opc("as_vezes","Às vezes"), new Opc("frequente","Frequente")),
        new Pergunta("adl_sem_ajuda",            "Realiza atividades do dia a dia sem ajuda?",         "condicao", 2,
            new Opc("sim","Sim"), new Opc("as_vezes","Às vezes"), new Opc("nao","Não")),
        new Pergunta("atividade_freq_semana",    "Frequência de atividade física por semana",          "condicao", 3,
            new Opc("nunca","Nunca"), new Opc("1x","1×/semana"), new Opc("2x","2×/semana"),
            new Opc("3x","3×/semana"), new Opc("4x_ou_mais","4×/semana ou mais")),
        new Pergunta("dores_articulares",        "Dores musculares/articulares com frequência?",       "condicao", 4,
            new Opc("nao","Não"), new Opc("as_vezes","Às vezes"), new Opc("frequente","Frequente")),
        new Pergunta("mobilidade_nivel",         "Como você avalia sua mobilidade?",                   "condicao", 5,
            new Opc("baixo","Baixo"), new Opc("medio","Médio"), new Opc("alto","Alto")),

        // ── SAÚDE CARDIOVASCULAR ─────────────────────────────────────────────
        new Pergunta("hipertensao",              "Tem hipertensão?",                                   "cardio", 6,
            new Opc("nao","Não"), new Opc("sim_controlada","Sim, controlada"),
            new Opc("sim_nao_controlada","Sim, não controlada")),
        new Pergunta("problema_cardiaco",        "Já teve problema cardíaco?",                         "cardio", 7,
            new Opc("nao","Não"), new Opc("sim","Sim")),
        new Pergunta("falta_ar_esforco_leve",    "Sente falta de ar em esforço leve?",                "cardio", 8,
            new Opc("nunca","Nunca"), new Opc("as_vezes","Às vezes"), new Opc("frequente","Frequente")),
        new Pergunta("medicacao_coracao_pressao","Usa medicação para coração/pressão?",               "cardio", 9,
            new Opc("nao","Não"), new Opc("sim","Sim")),
        new Pergunta("recomendacao_limitar_esforco","Algum médico recomendou limitar esforço?",       "cardio", 10,
            new Opc("nao","Não"), new Opc("sim","Sim")),

        // ── FORÇA E EQUILÍBRIO ───────────────────────────────────────────────
        new Pergunta("inseguranca_caminhar",     "Sente insegurança ao caminhar?",                    "forca", 11,
            new Opc("nao","Não"), new Opc("as_vezes","Às vezes"), new Opc("sim","Sim")),
        new Pergunta("quedas_ultimo_ano",        "Quantas quedas no último ano?",                     "forca", 12,
            new Opc("nenhuma","Nenhuma"), new Opc("1","1 vez"), new Opc("2oumais","2 ou mais")),
        new Pergunta("levantar_sem_apoio",       "Consegue levantar da cadeira sem apoio?",           "forca", 13,
            new Opc("sim","Sim"), new Opc("dificuldade","Com dificuldade"), new Opc("nao_consegue","Não consigo")),
        new Pergunta("equilibrio_unipodal",      "Equilíbrio em um pé (segundos)",                   "forca", 14,
            new Opc("10oumais","10 seg ou mais"), new Opc("5a9","5 a 9 seg"), new Opc("menos5","menos de 5 seg")),
        new Pergunta("dores_membros_tronco",     "Dores em membros ou tronco?",                       "forca", 15,
            new Opc("nao","Não"), new Opc("as_vezes","Às vezes"), new Opc("frequente","Frequente")),

        // ── FLEXIBILIDADE ────────────────────────────────────────────────────
        new Pergunta("tocar_pes_sem_dobrar",     "Toca os pés sem dobrar os joelhos?",               "flex", 16,
            new Opc("sim","Sim"), new Opc("com_dificuldade","Com dificuldade"), new Opc("nao","Não")),
        new Pergunta("rigidez_ao_acordar",       "Sente rigidez ao acordar?",                        "flex", 17,
            new Opc("nao","Não"), new Opc("as_vezes","Às vezes"), new Opc("frequente","Frequente")),
        new Pergunta("alonga_regularmente",      "Faz alongamento regularmente?",                    "flex", 18,
            new Opc("sim","Sim"), new Opc("as_vezes","Às vezes"), new Opc("nao","Não")),
        new Pergunta("dificuldade_coordenacao",  "Dificuldade de coordenação motora?",               "flex", 19,
            new Opc("nao","Não"), new Opc("leve","Leve"), new Opc("moderada","Moderada"), new Opc("grave","Grave")),
        new Pergunta("quer_melhorar_flexibilidade","Deseja melhorar a flexibilidade?",              "flex", 20,
            new Opc("sim","Sim"), new Opc("nao","Não")),

        // ── HÁBITOS DE VIDA ──────────────────────────────────────────────────
        new Pergunta("fuma",                     "Fuma?",                                            "habitos", 21,
            new Opc("nao","Não"), new Opc("sim_ocasional","Sim, ocasionalmente"), new Opc("sim_diario","Sim, diariamente")),
        new Pergunta("alcool_frequencia",        "Com que frequência consome álcool?",               "habitos", 22,
            new Opc("nao","Não"), new Opc("1a2_semana","1–2×/semana"),
            new Opc("3oumais_semana","3+/semana"), new Opc("diario","Diariamente")),
        new Pergunta("alimentacao_avaliacao",    "Como avalia sua alimentação?",                     "habitos", 23,
            new Opc("boa","Boa"), new Opc("regular","Regular"), new Opc("ruim","Ruim")),
        new Pergunta("dorme_bem",                "Dorme bem?",                                       "habitos", 24,
            new Opc("sim","Sim"), new Opc("as_vezes","Às vezes"), new Opc("nao","Não")),
        new Pergunta("ativ_ao_ar_livre",         "Faz atividades ao ar livre?",                      "habitos", 25,
            new Opc("nunca","Nunca"), new Opc("1x_semana","1×/semana"),
            new Opc("2a3_semana","2–3×/semana"), new Opc("4oumais_semana","4+/semana")),

        // ── SAÚDE MENTAL ─────────────────────────────────────────────────────
        new Pergunta("solidao_desmotivacao",     "Sente solidão ou desmotivação?",                   "mental", 26,
            new Opc("nunca","Nunca"), new Opc("as_vezes","Às vezes"), new Opc("frequente","Frequente")),
        new Pergunta("participa_grupos_sociais", "Participa de grupos sociais?",                     "mental", 27,
            new Opc("nunca","Nunca"), new Opc("mensal","Mensal"), new Opc("semanal","Semanal")),
        new Pergunta("estresse_ansiedade",       "Sente estresse ou ansiedade?",                     "mental", 28,
            new Opc("nunca","Nunca"), new Opc("as_vezes","Às vezes"), new Opc("frequente","Frequente")),
        new Pergunta("diag_depressao",           "Tem diagnóstico de depressão?",                    "mental", 29,
            new Opc("nao","Não"), new Opc("sim","Sim")),
        new Pergunta("prazer_exercicio",         "Sente prazer em se exercitar?",                    "mental", 30,
            new Opc("sim","Sim"), new Opc("as_vezes","Às vezes"), new Opc("nao","Não")),

        // ── OBJETIVOS ────────────────────────────────────────────────────────
        new Pergunta("objetivo_principal",       "Qual o seu objetivo principal?",                   "prefer", 31,
            new Opc("mobilidade","Mobilidade"), new Opc("forca","Força"),
            new Opc("equilibrio","Equilíbrio"), new Opc("relaxar","Relaxar"), new Opc("emagrecer","Emagrecer")),
        new Pergunta("preferencia_social",       "Prefere treinar sozinho ou em grupo?",             "prefer", 32,
            new Opc("individual","Individual"), new Opc("grupo","Em grupo"), new Opc("indiferente","Indiferente")),
        new Pergunta("intensidade_preferida",    "Qual intensidade prefere?",                        "prefer", 33,
            new Opc("leve","Leve"), new Opc("moderada","Moderada")),
        new Pergunta("gosta_musica",             "Gosta de música durante o treino?",                "prefer", 34,
            new Opc("sim","Sim"), new Opc("nao","Não")),
        new Pergunta("local_preferido",          "Local preferido para exercícios",                  "prefer", 35,
            new Opc("casa","Em casa"), new Opc("academia","Academia"), new Opc("parque","Parque")),

        // ── ROTINA E DISPONIBILIDADE ─────────────────────────────────────────
        new Pergunta("dias_por_semana",          "Quantos dias por semana pode treinar?",            "rotina", 36,
            new Opc("1","1 dia"), new Opc("2","2 dias"), new Opc("3","3 dias"), new Opc("4oumais","4 ou mais")),
        new Pergunta("tempo_por_dia",            "Quanto tempo disponível por dia?",                 "rotina", 37,
            new Opc("15","15 min"), new Opc("20","20 min"), new Opc("30","30 min"),
            new Opc("45","45 min"), new Opc("60","60 min")),
        new Pergunta("horario_preferido",        "Horário preferido",                                "rotina", 38,
            new Opc("manha","Manhã"), new Opc("tarde","Tarde"), new Opc("noite","Noite")),
        new Pergunta("equipamentos",             "Equipamentos disponíveis em casa",                 "rotina", 39,
            new Opc("nenhum","Nenhum"), new Opc("halteres","Halteres"), new Opc("elastico","Elástico"),
            new Opc("halteres_e_elastico","Halteres + Elástico"), new Opc("outros","Outros")),
        new Pergunta("acomp_medico_ou_fisio",    "Tem acompanhamento médico ou de fisioterapeuta?", "rotina", 40,
            new Opc("nao","Não"), new Opc("sim","Sim"))
    );

    // -------------------------------------------------------------------------
    // 5 exercícios base
    // -------------------------------------------------------------------------
    record Exercicio(String nome, int tempoMin, Map<String, Object> tags) {}

    private static final List<Exercicio> EXERCICIOS = List.of(
        new Exercicio("Caminhada ao ar livre",                           30, Map.of("grupo","aerobico","tipo","caminhada")),
        new Exercicio("Dança leve/ritmada",                              30, Map.of("grupo","aerobico","tipo","dança")),
        new Exercicio("Mobilidade de quadril/tornozelo",                 30, Map.of("grupo","mobilidade","tipo","alongamento")),
        new Exercicio("Alongamentos suaves (sentado)",                   20, Map.of("grupo","flexibilidade","tipo","alongamento")),
        new Exercicio("Fortalecimento de membros inferiores (cadeira)",  20, Map.of("grupo","forca","tipo","resistencia"))
    );

    // -------------------------------------------------------------------------
    // CommandLineRunner
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public void run(String... args) {
        seedPerguntas();
        seedExercicios();
    }

    private void seedPerguntas() {
        if (perguntaRepository.countBySlugIsNotNull() > 0) {
            log.info("[DataSeeder] Perguntas já existem — seed ignorado.");
            return;
        }
        log.info("[DataSeeder] Semeando {} perguntas…", PERGUNTAS.size());
        for (Pergunta pd : PERGUNTAS) {
            ex_pergunta p = new ex_pergunta();
            p.setSlug(pd.slug());
            p.setEnunciado(pd.enunciado());
            p.setCategoria(pd.categoria());
            p.setOrdem(pd.ordem());
            p.setTipo("opcao");
            p = perguntaRepository.save(p);

            int ordemOpc = 1;
            for (Opc od : pd.opcoes()) {
                ex_opcao_pergunta opcao = ex_opcao_pergunta.builder()
                        .pergunta(p)
                        .codigo(od.codigo())
                        .rotulo(od.rotulo())
                        .ordem(ordemOpc++)
                        .build();
                opcaoPerguntaRepository.save(opcao);
            }
        }
        log.info("[DataSeeder] Seed de perguntas concluído.");
    }

    private void seedExercicios() {
        for (Exercicio ed : EXERCICIOS) {
            if (exercicioRepository.findByNomeIgnoreCase(ed.nome()).isPresent()) continue;
            ex_exercicio ex = new ex_exercicio();
            ex.setNome(ed.nome());
            ex.setTempoMedioMin(ed.tempoMin());
            ex.setTagsJson(ed.tags());
            exercicioRepository.save(ex);
            log.info("[DataSeeder] Exercício criado: {}", ed.nome());
        }
    }
}
