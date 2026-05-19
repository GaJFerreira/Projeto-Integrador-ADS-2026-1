package br.pucgo.ads.projetointegrador.carehub.service;

import br.pucgo.ads.projetointegrador.carehub.dto.mensagem.ContatoDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.mensagem.MensagemRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.mensagem.MensagemResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.entity.Mensagem;
import br.pucgo.ads.projetointegrador.carehub.entity.Usuario;
import br.pucgo.ads.projetointegrador.carehub.exception.OperacaoNaoPermitidaException;
import br.pucgo.ads.projetointegrador.carehub.repository.AgendamentoRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.CareHubMensagemRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.CareHubUsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Service de Mensagens do CareHub.
 *
 * <p>
 * <strong>Mudança de arquitetura:</strong> a entidade {@link Mensagem} agora
 * armazena
 * {@code remetenteId} e {@code destinatarioId} como Long (sem FK de objeto para
 * plataforma.User).
 * Este service resolve os nomes dos usuários consultando o
 * {@link UsuarioRepository} local
 * ({@code care_hub.usuario}) quando necessário para montar o DTO de resposta —
 * mantendo
 * compatibilidade com o front-end sem importar nenhuma classe da plataforma.
 *
 * <p>
 * O método {@code buscarMensagensNaoLidas} foi refatorado para usar
 * {@code findByDestinatarioIdAndLidaFalseOrderByDataEnvioDesc} em vez de
 * receber um objeto {@code User} como parâmetro.
 */
@Service
@RequiredArgsConstructor
public class MensagemService {

    private final CareHubMensagemRepository mensagemRepository;
    private final CareHubUsuarioRepository careHubUsuarioRepository;
    private final AgendamentoRepository agendamentoRepository;

    // ── Enviar mensagem ───────────────────────────────────────────────────────

    @Transactional
    public MensagemResponseDTO enviarMensagem(Long remetenteId, MensagemRequestDTO dto) {
        Objects.requireNonNull(remetenteId, "Remetente ID não pode ser nulo");
        Long destinatarioId = Objects.requireNonNull(dto.getDestinatarioId(), "Destinatário ID não pode ser nulo");

        // Garantir que ambos os usuários existem localmente
        careHubUsuarioRepository.findById(remetenteId)
                .orElseThrow(() -> new RuntimeException("Remetente não encontrado: " + remetenteId));
        careHubUsuarioRepository.findById(destinatarioId)
                .orElseThrow(() -> new RuntimeException("Destinatário não encontrado: " + destinatarioId));

        // Regra de negócio: só pode trocar mensagens se existir atendimento entre as
        // partes
        boolean podeTrocar = agendamentoRepository.existsBetweenUsers(remetenteId, destinatarioId);
        if (!podeTrocar) {
            throw new OperacaoNaoPermitidaException(
                    "Troca de mensagens só é permitida quando existe um atendimento entre as partes");
        }

        Mensagem mensagem = new Mensagem();
        mensagem.setRemetenteId(remetenteId);
        mensagem.setDestinatarioId(destinatarioId);
        mensagem.setConteudo(dto.getConteudo());
        mensagem.setMediaUrl(dto.getMediaUrl());
        mensagem.setMediaType(dto.getMediaType());

        mensagem = mensagemRepository.save(mensagem);
        return toResponseDTO(mensagem);
    }

    // ── Listar mensagens de um usuário ────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MensagemResponseDTO> listarMensagens(Long usuarioId) {
        Objects.requireNonNull(usuarioId, "Usuario ID não pode ser nulo");
        return mensagemRepository
                .findByRemetenteIdOrDestinatarioIdOrderByDataEnvioDesc(usuarioId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // ── Buscar conversa entre dois usuários ───────────────────────────────────

    @Transactional(readOnly = true)
    public List<MensagemResponseDTO> buscarConversa(Long usuario1Id, Long usuario2Id) {
        Objects.requireNonNull(usuario1Id, "Usuario1 ID não pode ser nulo");
        Objects.requireNonNull(usuario2Id, "Usuario2 ID não pode ser nulo");

        boolean existe = agendamentoRepository.existsBetweenUsers(usuario1Id, usuario2Id);
        if (!existe) {
            throw new OperacaoNaoPermitidaException(
                    "Acesso à conversa negado: sem atendimento entre as partes");
        }

        return mensagemRepository.findConversaBetween(usuario1Id, usuario2Id)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // ── Mensagens não lidas ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MensagemResponseDTO> buscarMensagensNaoLidas(Long usuarioId) {
        Objects.requireNonNull(usuarioId, "Usuario ID não pode ser nulo");
        // Verificar que o usuário existe localmente
        careHubUsuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + usuarioId));

        // Refatorado: usa destinatarioId (Long) em vez de objeto User
        return mensagemRepository
                .findByDestinatarioIdAndLidaFalseOrderByDataEnvioDesc(usuarioId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // ── Marcar como lida ──────────────────────────────────────────────────────

    @Transactional
    public void marcarComoLida(Long mensagemId) {
        Objects.requireNonNull(mensagemId, "Mensagem ID não pode ser nulo");
        Mensagem mensagem = mensagemRepository.findById(mensagemId)
                .orElseThrow(() -> new RuntimeException("Mensagem não encontrada: " + mensagemId));
        mensagem.setLida(true);
        mensagemRepository.save(mensagem);
    }

    @Transactional(readOnly = true)
    public long contarMensagensNaoLidas(Long usuarioId) {
        Objects.requireNonNull(usuarioId, "Usuario ID não pode ser nulo");
        return mensagemRepository.countMensagensNaoLidas(usuarioId);
    }

    // ── Listar contatos ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ContatoDTO> listarContatos(Long usuarioId) {
        Objects.requireNonNull(usuarioId, "Usuario ID não pode ser nulo");

        List<Long> contatoIds = mensagemRepository.findContatoIds(usuarioId);
        if (contatoIds == null || contatoIds.isEmpty()) {
            return List.of();
        }

        return careHubUsuarioRepository.findAllById(contatoIds).stream()
                .map(usuario -> {
                    ContatoDTO dto = new ContatoDTO();
                    dto.setId(usuario.getId());
                    // Resolve o nome a partir da entidade local — sem import de plataforma.User
                    dto.setNome(usuario.getName());
                    dto.setPerfil(resolverPerfil(usuario));
                    dto.setEmail(usuario.getEmail());

                    long naoLidas = mensagemRepository.countMensagensNaoLidasDeRemetente(usuarioId, usuario.getId());
                    dto.setMensagensNaoLidas(naoLidas);

                    Mensagem ultimaMensagem = mensagemRepository.findUltimaMensagemEntre(usuarioId, usuario.getId());
                    if (ultimaMensagem != null) {
                        String preview = ultimaMensagem.getConteudo();
                        if (preview != null) {
                            dto.setUltimaMensagem(preview.length() > 50 ? preview.substring(0, 50) + "..." : preview);
                        } else {
                            dto.setUltimaMensagem("🎤 Áudio");
                        }
                        dto.setDataUltimaMensagem(ultimaMensagem.getDataEnvio());
                    }
                    return dto;
                })
                .sorted((c1, c2) -> {
                    if (c1.getDataUltimaMensagem() == null)
                        return 1;
                    if (c2.getDataUltimaMensagem() == null)
                        return -1;
                    return c2.getDataUltimaMensagem().compareTo(c1.getDataUltimaMensagem());
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void marcarConversaComoLida(Long usuarioId, Long remetenteId) {
        Objects.requireNonNull(usuarioId, "Usuario ID não pode ser nulo");
        Objects.requireNonNull(remetenteId, "Remetente ID não pode ser nulo");
        mensagemRepository.marcarComoLidas(usuarioId, remetenteId);
    }

    // ── Helpers privados ──────────────────────────────────────────────────────

    /**
     * Resolve o perfil (role) do usuário como String descritiva.
     * Substitui o antigo {@code usuario.getClass().getSimpleName().toUpperCase()}
     * que dependia da hierarquia de herança legada.
     */
    private String resolverPerfil(Usuario usuario) {
        if (usuario.getRole() != null) {
            return usuario.getRole();
        }
        return "USUARIO";
    }

    /**
     * Converte uma {@link Mensagem} para DTO de resposta.
     *
     * <p>
     * Os nomes do remetente e destinatário são resolvidos a partir do
     * {@code UsuarioRepository} local. Caso o usuário não seja encontrado
     * (dados inconsistentes), retorna "Usuário desconhecido" sem lançar exceção.
     */
    private MensagemResponseDTO toResponseDTO(Mensagem mensagem) {
        MensagemResponseDTO dto = new MensagemResponseDTO();
        dto.setId(mensagem.getId());
        dto.setRemetenteId(mensagem.getRemetenteId());
        dto.setDestinatarioId(mensagem.getDestinatarioId());
        dto.setConteudo(mensagem.getConteudo());
        dto.setDataEnvio(mensagem.getDataEnvio());
        dto.setLida(mensagem.getLida());
        dto.setMediaUrl(mensagem.getMediaUrl());
        dto.setMediaType(mensagem.getMediaType());

        // Resolve nomes consultando o repositório local
        dto.setRemetenteNome(resolverNome(mensagem.getRemetenteId()));
        dto.setDestinatarioNome(resolverNome(mensagem.getDestinatarioId()));

        return dto;
    }

    private String resolverNome(Long usuarioId) {
        if (usuarioId == null)
            return "Desconhecido";
        return careHubUsuarioRepository.findById(usuarioId)
                .map(Usuario::getName)
                .orElse("Usuário desconhecido");
    }
}
