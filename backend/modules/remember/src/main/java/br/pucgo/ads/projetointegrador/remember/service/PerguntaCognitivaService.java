package br.pucgo.ads.projetointegrador.remember.service;

import br.pucgo.ads.projetointegrador.remember.domain.GatilhoTipo;
import br.pucgo.ads.projetointegrador.remember.domain.StatusPergunta;
import br.pucgo.ads.projetointegrador.remember.dto.Pergunta.PerguntaCognitivaResponseDTO;
import br.pucgo.ads.projetointegrador.remember.entity.Diario;
import br.pucgo.ads.projetointegrador.remember.entity.Lembranca;
import br.pucgo.ads.projetointegrador.remember.entity.PerguntaCognitiva;
import br.pucgo.ads.projetointegrador.remember.entity.PerguntaTemplate;
import br.pucgo.ads.projetointegrador.remember.entity.Usuario;
import br.pucgo.ads.projetointegrador.remember.repository.DiarioRepository;
import br.pucgo.ads.projetointegrador.remember.repository.LembrancaRepository;
import br.pucgo.ads.projetointegrador.remember.repository.PerguntaCognitivaRepository;
import br.pucgo.ads.projetointegrador.remember.repository.PerguntaTemplateRepository;
import br.pucgo.ads.projetointegrador.remember.repository.UsuarioRememberRepository;
import br.pucgo.ads.projetointegrador.remember.utils.JwtClaimsUtils.UsuarioTokenClaims;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class PerguntaCognitivaService {

    private static final List<ModeloPergunta> MODELOS_AUTOMATICOS = List.of(
            new ModeloPergunta("DETALHE_LEMBRANCA", "Qual detalhe voce mais lembra sobre {titulo}?", OrigemMemoria.LEMBRANCA, "titulo"),
            new ModeloPergunta("PESSOAS_LEMBRANCA", "Quem estava com voce em {titulo}, e como foi estar com essas pessoas?", OrigemMemoria.LEMBRANCA, "titulo"),
            new ModeloPergunta("LOCAL_LEMBRANCA", "O que havia de especial no local {local}?", OrigemMemoria.LEMBRANCA, "local"),
            new ModeloPergunta("SENTIMENTO_LEMBRANCA", "Como voce se sentiu quando viveu {titulo}?", OrigemMemoria.LEMBRANCA, "titulo"),
            new ModeloPergunta("REFLEXAO_DIARIO", "O que foi mais importante no dia em que voce escreveu {titulo}?", OrigemMemoria.DIARIO, "titulo"),
            new ModeloPergunta("APRENDIZADO_DIARIO", "Que aprendizado ou pensamento voce quer guardar de {titulo}?", OrigemMemoria.DIARIO, "titulo")
    );

    private final PerguntaCognitivaRepository perguntaRepository;
    private final PerguntaTemplateRepository templateRepository;
    private final LembrancaRepository lembrancaRepository;
    private final DiarioRepository diarioRepository;
    private final UsuarioRememberRepository usuarioRepository;

    public List<PerguntaCognitivaResponseDTO> listarPerguntasPorUsuario(Long identificadorUsuario, String status) {
        List<PerguntaCognitiva> perguntas;

        if (StringUtils.hasText(status)) {
            perguntas = perguntaRepository.findByIdentificadorUsuarioAndStatusOrderByDataGeracaoDesc(
                    identificadorUsuario,
                    resolverStatus(status).getCodigo());
        } else {
            perguntas = perguntaRepository.findByIdentificadorUsuarioOrderByDataGeracaoDesc(identificadorUsuario);
        }

        return perguntas.stream()
                .map(PerguntaCognitivaResponseDTO::new)
                .collect(Collectors.toList());
    }

    public List<PerguntaCognitivaResponseDTO> listarPerguntasPendentesPorUsuario(Long identificadorUsuario) {
        return listarPerguntasPorUsuario(identificadorUsuario, StatusPergunta.ENVIADA.name());
    }

    @Transactional
    public Optional<PerguntaCognitivaResponseDTO> gerarPerguntaParaUsuario(UsuarioTokenClaims usuarioToken) {
        Usuario usuario = salvarOuAtualizarUsuario(usuarioToken);

        return perguntaRepository
                .findFirstByIdentificadorUsuarioAndStatusOrderByDataGeracaoDesc(
                        usuario.getIdUsuario(),
                        StatusPergunta.ENVIADA.getCodigo())
                .map(pergunta -> Optional.of(new PerguntaCognitivaResponseDTO(pergunta)))
                .orElseGet(() -> gerarPerguntaAutomatica(usuario.getIdUsuario()).map(PerguntaCognitivaResponseDTO::new));
    }

    private Optional<PerguntaCognitiva> gerarPerguntaAutomatica(Long identificadorUsuario) {
        List<PerguntaTemplate> templatesAutomaticos = garantirModelosAutomaticos();
        List<PerguntaCognitiva> perguntasExistentes = perguntaRepository.findByIdentificadorUsuarioOrderByDataGeracaoDesc(identificadorUsuario);

        List<Lembranca> lembrancas = lembrancaRepository.findAllByIdentificadorUsuario(identificadorUsuario);
        List<Diario> diarios = diarioRepository.findAllByIdentificadorUsuario(identificadorUsuario);
        List<CandidatoAutomatico> candidatos = montarCandidatos(templatesAutomaticos, lembrancas, diarios, perguntasExistentes);

        CandidatoAutomatico escolhido = candidatos.stream()
                .min(Comparator
                        .comparing(CandidatoAutomatico::ordemMemoria)
                        .thenComparing(CandidatoAutomatico::ordem))
                .orElse(null);

        if (escolhido == null) {
            return Optional.empty();
        }

        PerguntaCognitiva pergunta = new PerguntaCognitiva();
        pergunta.setIdentificadorTemplateOrigem(escolhido.template().getIdentificadorPerguntaTemplate());
        pergunta.setIdentificadorUsuario(identificadorUsuario);
        pergunta.setStatus(StatusPergunta.ENVIADA.getCodigo());
        pergunta.setTextoPergunta(formatarPergunta(escolhido.modelo(), escolhido.memoria()));

        if (escolhido.memoria() instanceof Lembranca lembranca) {
            pergunta.setIdentificadorLembranca(lembranca.getIdentificadorLembranca());
        } else if (escolhido.memoria() instanceof Diario diario) {
            pergunta.setIdentificadorDiario(diario.getIdentificadorDiario());
        }

        return Optional.of(perguntaRepository.save(pergunta));
    }

    private List<PerguntaTemplate> garantirModelosAutomaticos() {
        List<PerguntaTemplate> templates = new ArrayList<>();

        for (ModeloPergunta modelo : MODELOS_AUTOMATICOS) {
            PerguntaTemplate template = templateRepository.findFirstByTextoTemplate(modelo.texto())
                    .orElseGet(() -> {
                        PerguntaTemplate novoTemplate = new PerguntaTemplate();
                        novoTemplate.setTextoTemplate(modelo.texto());
                        novoTemplate.setGatilhoTipo(GatilhoTipo.GENERICO.getCodigo());
                        novoTemplate.setCampoPlaceholder(modelo.placeholder());
                        novoTemplate.setAtivo(true);
                        return templateRepository.save(novoTemplate);
                    });

            if (!template.isAtivo()) {
                template.setAtivo(true);
                template = templateRepository.save(template);
            }

            templates.add(template);
        }

        return templates;
    }

    private List<CandidatoAutomatico> montarCandidatos(
            List<PerguntaTemplate> templates,
            List<Lembranca> lembrancas,
            List<Diario> diarios,
            List<PerguntaCognitiva> perguntasExistentes
    ) {
        List<CandidatoAutomatico> candidatos = new ArrayList<>();

        for (int i = 0; i < MODELOS_AUTOMATICOS.size(); i++) {
            int ordem = i;
            ModeloPergunta modelo = MODELOS_AUTOMATICOS.get(i);
            PerguntaTemplate template = templates.get(i);

            if (modelo.origem() == OrigemMemoria.LEMBRANCA) {
                lembrancas.stream()
                        .filter(lembranca -> modelo.placeholder() == null || temValorPlaceholder(lembranca, modelo.placeholder()))
                        .filter(lembranca -> !perguntaJaGerada(perguntasExistentes, template, lembranca, null))
                        .sorted(Comparator.comparing(Lembranca::getDataAcontecimento, Comparator.nullsFirst(Comparator.reverseOrder())))
                        .forEach(lembranca -> candidatos.add(new CandidatoAutomatico(
                                ordemMemoria(lembranca.getDataAcontecimento()),
                                ordem,
                                modelo,
                                template,
                                lembranca)));
            } else if (modelo.origem() == OrigemMemoria.DIARIO) {
                diarios.stream()
                        .filter(diario -> modelo.placeholder() == null || StringUtils.hasText(getValorPlaceholder(diario, modelo.placeholder())))
                        .filter(diario -> !perguntaJaGerada(perguntasExistentes, template, null, diario))
                        .sorted(Comparator.comparing(Diario::getDataEscrita, Comparator.nullsFirst(Comparator.reverseOrder())))
                        .forEach(diario -> candidatos.add(new CandidatoAutomatico(
                                ordemMemoria(diario.getDataEscrita()),
                                ordem,
                                modelo,
                                template,
                                diario)));
            }
        }

        return candidatos;
    }

    private boolean perguntaJaGerada(
            List<PerguntaCognitiva> perguntasExistentes,
            PerguntaTemplate template,
            Lembranca lembranca,
            Diario diario
    ) {
        return perguntasExistentes.stream().anyMatch(pergunta -> {
            boolean mesmoTemplate = template.getIdentificadorPerguntaTemplate().equals(pergunta.getIdentificadorTemplateOrigem());
            boolean mesmaLembranca = lembranca != null
                    && lembranca.getIdentificadorLembranca().equals(pergunta.getIdentificadorLembranca());
            boolean mesmoDiario = diario != null
                    && diario.getIdentificadorDiario().equals(pergunta.getIdentificadorDiario());

            return mesmoTemplate && (mesmaLembranca || mesmoDiario);
        });
    }

    private long ordemMemoria(java.time.LocalDate data) {
        if (data == null) {
            return Long.MAX_VALUE;
        }
        return -data.toEpochDay();
    }

    private boolean temValorPlaceholder(Lembranca lembranca, String placeholder) {
        return StringUtils.hasText(getValorPlaceholder(lembranca, placeholder));
    }

    private String formatarPergunta(ModeloPergunta modelo, Object memoria) {
        if (!StringUtils.hasText(modelo.placeholder()) || memoria == null) {
            return modelo.texto();
        }

        return modelo.texto().replace("{" + modelo.placeholder() + "}", getValorPlaceholder(memoria, modelo.placeholder()));
    }

    private String getValorPlaceholder(Object memoria, String campoPlaceholder) {
        if (memoria instanceof Lembranca lembranca) {
            if ("titulo".equalsIgnoreCase(campoPlaceholder)) {
                return valorOuVazio(lembranca.getTitulo());
            }
            if ("local".equalsIgnoreCase(campoPlaceholder)) {
                return valorOuVazio(lembranca.getLocal());
            }
            if ("pessoasPresentes".equalsIgnoreCase(campoPlaceholder)) {
                return valorOuVazio(lembranca.getPessoasPresentes());
            }
        } else if (memoria instanceof Diario diario && "titulo".equalsIgnoreCase(campoPlaceholder)) {
            return valorOuVazio(diario.getTitulo());
        }

        return "";
    }

    private String valorOuVazio(String valor) {
        return valor == null ? "" : valor;
    }

    private Usuario salvarOuAtualizarUsuario(UsuarioTokenClaims usuarioToken) {
        Usuario usuario = usuarioRepository.findByPlatformUserId(usuarioToken.userId())
                .or(() -> usuarioRepository.findByIdUsuario(usuarioToken.userId()))
                .orElseGet(Usuario::new);

        if (usuario.getIdUsuario() == null) {
            usuario.setIdUsuario(usuarioToken.userId());
        }

        usuario.setPlatformUserId(usuarioToken.userId());
        usuario.setNome(usuarioToken.nome());
        usuario.setEmail(usuarioToken.email());
        return usuarioRepository.saveAndFlush(usuario);
    }

    private StatusPergunta resolverStatus(String status) {
        String statusNormalizado = status.trim().toUpperCase();
        return switch (statusNormalizado) {
            case "PENDENTE", "PENDENTES", "ENVIADA", "ENVIADAS" -> StatusPergunta.ENVIADA;
            case "RESPONDIDA", "RESPONDIDAS" -> StatusPergunta.RESPONDIDA;
            default -> StatusPergunta.of(Integer.parseInt(statusNormalizado));
        };
    }

    private enum OrigemMemoria {
        LEMBRANCA,
        DIARIO
    }

    private record ModeloPergunta(String codigo, String texto, OrigemMemoria origem, String placeholder) {
    }

    private record CandidatoAutomatico(long ordemMemoria, int ordem, ModeloPergunta modelo, PerguntaTemplate template, Object memoria) {
    }
}
