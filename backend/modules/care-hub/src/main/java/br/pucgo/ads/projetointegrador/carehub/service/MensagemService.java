package br.pucgo.ads.projetointegrador.carehub.service;

import br.pucgo.ads.projetointegrador.carehub.dto.mensagem.ContatoDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.mensagem.MensagemRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.mensagem.MensagemResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.entity.Mensagem;
import br.pucgo.ads.projetointegrador.carehub.entity.Cuidador;
import br.pucgo.ads.projetointegrador.carehub.entity.Cliente;
import br.pucgo.ads.projetointegrador.carehub.exception.OperacaoNaoPermitidaException;
import br.pucgo.ads.projetointegrador.carehub.repository.AgendamentoRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.CareHubMensagemRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.CuidadorRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MensagemService {

    private final CareHubMensagemRepository mensagemRepository;
    private final CuidadorRepository cuidadorRepository;
    private final ClienteRepository clienteRepository;
    private final AgendamentoRepository agendamentoRepository;

    @Transactional
    public MensagemResponseDTO enviarMensagem(Long remetenteId, MensagemRequestDTO dto) {
        return enviarMensagem(remetenteId, dto, null, null);
    }

    @Transactional
    public MensagemResponseDTO enviarMensagem(Long remetenteId, MensagemRequestDTO dto, String remetenteTipo,
            String destinatarioTipo) {
        Objects.requireNonNull(remetenteId, "Remetente ID não pode ser nulo");
        Long destinatarioId = Objects.requireNonNull(dto.getDestinatarioId(), "Destinatário ID não pode ser nulo");

        if (!existeUsuario(remetenteId)) {
            throw new RuntimeException("Remetente não encontrado: " + remetenteId);
        }
        if (!existeUsuario(destinatarioId)) {
            throw new RuntimeException("Destinatário não encontrado: " + destinatarioId);
        }

        boolean podeTrocar = agendamentoRepository.existsBetweenUsers(remetenteId, destinatarioId);
        if (!podeTrocar) {
            throw new OperacaoNaoPermitidaException(
                    "Troca de mensagens só é permitida quando existe um atendimento entre as partes");
        }

        Mensagem mensagem = new Mensagem();
        mensagem.setRemetenteId(remetenteId);
        mensagem.setRemetenteTipo(remetenteTipo);
        mensagem.setDestinatarioId(destinatarioId);
        mensagem.setDestinatarioTipo(destinatarioTipo);
        mensagem.setConteudo(dto.getConteudo());
        mensagem.setMediaUrl(dto.getMediaUrl());
        mensagem.setMediaType(dto.getMediaType());

        mensagem = mensagemRepository.save(mensagem);
        return toResponseDTO(mensagem);
    }

    @Transactional(readOnly = true)
    public List<MensagemResponseDTO> listarMensagens(Long usuarioId) {
        Objects.requireNonNull(usuarioId, "Usuario ID não pode ser nulo");
        return mensagemRepository
                .findByRemetenteIdOrDestinatarioIdOrderByDataEnvioDesc(usuarioId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MensagemResponseDTO> buscarConversa(Long usuario1Id, Long usuario2Id) {
        Objects.requireNonNull(usuario1Id, "Usuario1 ID n\u00e3o pode ser nulo");
        Objects.requireNonNull(usuario2Id, "Usuario2 ID n\u00e3o pode ser nulo");

        // Usa existsAnyBetweenUsers para permitir visualizar hist\u00f3rico mesmo ap\u00f3s conclus\u00e3o
        boolean existe = agendamentoRepository.existsAnyBetweenUsers(usuario1Id, usuario2Id);
        if (!existe) {
            throw new OperacaoNaoPermitidaException(
                    "Acesso \u00e0 conversa negado: sem atendimento entre as partes");
        }

        return mensagemRepository.findConversaBetween(usuario1Id, usuario2Id)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MensagemResponseDTO> buscarMensagensNaoLidas(Long usuarioId) {
        Objects.requireNonNull(usuarioId, "Usuario ID não pode ser nulo");
        if (!existeUsuario(usuarioId)) {
            throw new RuntimeException("Usuário não encontrado: " + usuarioId);
        }

        return mensagemRepository
                .findByDestinatarioIdAndLidaFalseOrderByDataEnvioDesc(usuarioId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

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

    @Transactional(readOnly = true)
    public List<ContatoDTO> listarContatos(Long usuarioId, boolean usuarioEhCuidador) {
        Objects.requireNonNull(usuarioId, "Usuario ID não pode ser nulo");

        List<Long> contatoIds = mensagemRepository.findContatoIds(usuarioId);
        if (contatoIds == null || contatoIds.isEmpty()) {
            return List.of();
        }

        return contatoIds.stream()
                .map(id -> {
                    String name;
                    String role;
                    String email;
                    if (usuarioEhCuidador) {
                        Optional<Cliente> ocl = clienteRepository.findById(id);
                        if (ocl.isPresent()) {
                            name = ocl.get().getName();
                            role = ocl.get().getRole();
                            email = ocl.get().getEmail();
                        } else {
                            name = "Usuário desconhecido";
                            role = "CAREHUB_CLIENTE";
                            email = "";
                        }
                    } else {
                        Optional<Cuidador> oc = cuidadorRepository.findById(id);
                        if (oc.isPresent()) {
                            name = oc.get().getName();
                            role = oc.get().getRole();
                            email = oc.get().getEmail();
                        } else {
                            name = "Usuário desconhecido";
                            role = "CAREHUB_CUIDADOR";
                            email = "";
                        }
                    }

                    ContatoDTO dto = new ContatoDTO();
                    dto.setId(id);
                    dto.setNome(name);
                    dto.setPerfil(role != null ? role : "USUARIO");
                    dto.setEmail(email);

                    long naoLidas = mensagemRepository.countMensagensNaoLidasDeRemetente(usuarioId, id);
                    dto.setMensagensNaoLidas(naoLidas);

                    Mensagem ultimaMensagem = mensagemRepository.findUltimaMensagemEntre(usuarioId, id);
                    if (ultimaMensagem != null) {
                        String preview = ultimaMensagem.getConteudo();
                        if (preview != null) {
                            dto.setUltimaMensagem(preview.length() > 50 ? preview.substring(0, 50) + "..." : preview);
                        } else {
                            dto.setUltimaMensagem("🎤 Áudio");
                        }
                        dto.setDataUltimaMensagem(ultimaMensagem.getDataEnvio());
                        dto.setUltimoRemetenteId(ultimaMensagem.getRemetenteId());
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
        Objects.requireNonNull(usuarioId, "Usu\u00e1rio ID n\u00e3o pode ser nulo");
        Objects.requireNonNull(remetenteId, "Remetente ID n\u00e3o pode ser nulo");
        mensagemRepository.marcarComoLidas(usuarioId, remetenteId);
    }

    /**
     * Verifica se o chat entre dois usu\u00e1rios est\u00e1 ativo (permite envio de novas mensagens).
     * Retorna true apenas quando h\u00e1 agendamento PENDENTE, CONFIRMADO ou EM_ANDAMENTO.
     */
    @Transactional(readOnly = true)
    public boolean chatAtivo(Long usuario1Id, Long usuario2Id) {
        Objects.requireNonNull(usuario1Id, "Usu\u00e1rio1 ID n\u00e3o pode ser nulo");
        Objects.requireNonNull(usuario2Id, "Usu\u00e1rio2 ID n\u00e3o pode ser nulo");
        return agendamentoRepository.existsBetweenUsers(usuario1Id, usuario2Id);
    }

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
        dto.setRemetenteTipo(mensagem.getRemetenteTipo());
        dto.setDestinatarioTipo(mensagem.getDestinatarioTipo());

        dto.setRemetenteNome(resolverNome(mensagem.getRemetenteId()));
        dto.setDestinatarioNome(resolverNome(mensagem.getDestinatarioId()));

        return dto;
    }

    private String resolverNome(Long usuarioId) {
        if (usuarioId == null)
            return "Desconhecido";
            
        Optional<Cuidador> oc = cuidadorRepository.findById(usuarioId);
        if (oc.isPresent()) return oc.get().getName();
        
        Optional<Cliente> ocl = clienteRepository.findById(usuarioId);
        if (ocl.isPresent()) return ocl.get().getName();
        
        return "Usuário desconhecido";
    }
    
    private boolean existeUsuario(Long usuarioId) {
        return cuidadorRepository.existsById(usuarioId) || clienteRepository.existsById(usuarioId);
    }
}
