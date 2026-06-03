package br.pucgo.ads.projetointegrador.carehub.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.security.Principal;
import java.util.Map;
import java.util.List;

import br.pucgo.ads.projetointegrador.carehub.dto.mensagem.ContatoDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.mensagem.MensagemRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.mensagem.MensagemResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.service.MensagemService;

@RestController
@RequestMapping("/api/carehub/mensagens")
public class MensagemController {

    private enum TipoUsuario {
        CUIDADOR,
        CLIENTE
    }

    private static class UsuarioLocal {
        private final Long id;
        private final TipoUsuario tipo;

        private UsuarioLocal(Long id, TipoUsuario tipo) {
            this.id = id;
            this.tipo = tipo;
        }
    }

    @Autowired
    private MensagemService mensagemService;
    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.CareHubMensagemRepository mensagemRepository;
    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.MessageMediaRepository messageMediaRepository;

    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.CuidadorRepository cuidadorRepository;

    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.ClienteRepository clienteRepository;

    private Long obterIdLocal(Long platformUserId) {
        if (platformUserId == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "ID de usuario e obrigatorio");
        }

        var c = cuidadorRepository.findByPlatformUserId(platformUserId);
        if (c.isPresent())
            return c.get().getId();

        var cli = clienteRepository.findByPlatformUserId(platformUserId);
        if (cli.isPresent())
            return cli.get().getId();

        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND,
                "Usuário local do CareHub não encontrado para o platformUserId: " + platformUserId);
    }

    private Long obterIdLocalAutenticado(Principal principal) {
        return obterUsuarioLocalAutenticado(principal).id;
    }

    private UsuarioLocal obterUsuarioLocalAutenticado(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }

        String usernameOrEmail = principal.getName();

        var cuidador = cuidadorRepository.findByUsername(usernameOrEmail)
                .or(() -> cuidadorRepository.findByEmail(usernameOrEmail));
        if (cuidador.isPresent()) {
            return new UsuarioLocal(cuidador.get().getId(), TipoUsuario.CUIDADOR);
        }

        var cliente = clienteRepository.findByUsername(usernameOrEmail)
                .or(() -> clienteRepository.findByEmail(usernameOrEmail));
        if (cliente.isPresent()) {
            return new UsuarioLocal(cliente.get().getId(), TipoUsuario.CLIENTE);
        }

        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND,
                "Usuário local do CareHub não encontrado para o principal autenticado: " + usernameOrEmail);
    }

    private Long obterIdPlataforma(Long localUserId) {
        if (localUserId == null)
            return null;
        var c = cuidadorRepository.findById(localUserId);
        if (c.isPresent() && c.get().getPlatformUserId() != null)
            return c.get().getPlatformUserId();

        var cli = clienteRepository.findById(localUserId);
        if (cli.isPresent() && cli.get().getPlatformUserId() != null)
            return cli.get().getPlatformUserId();

        return localUserId;
    }

    private Long obterIdPlataforma(Long localUserId, TipoUsuario tipo) {
        if (localUserId == null)
            return null;

        if (tipo == TipoUsuario.CUIDADOR) {
            var c = cuidadorRepository.findById(localUserId);
            if (c.isPresent() && c.get().getPlatformUserId() != null)
                return c.get().getPlatformUserId();
        } else {
            var cli = clienteRepository.findById(localUserId);
            if (cli.isPresent() && cli.get().getPlatformUserId() != null)
                return cli.get().getPlatformUserId();
        }

        return localUserId;
    }

    private TipoUsuario tipoOposto(TipoUsuario tipo) {
        return tipo == TipoUsuario.CUIDADOR ? TipoUsuario.CLIENTE : TipoUsuario.CUIDADOR;
    }

    private TipoUsuario parseTipo(String tipo) {
        if (tipo == null || tipo.isBlank())
            return null;
        try {
            return TipoUsuario.valueOf(tipo);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private MensagemResponseDTO converterParaPlataforma(MensagemResponseDTO dto, UsuarioLocal usuarioAutenticado) {
        if (dto == null)
            return null;

        TipoUsuario remetenteTipo = parseTipo(dto.getRemetenteTipo());
        TipoUsuario destinatarioTipo = parseTipo(dto.getDestinatarioTipo());
        boolean remetenteEhUsuario = dto.getRemetenteId() != null
                && dto.getRemetenteId().equals(usuarioAutenticado.id)
                && (remetenteTipo == null || remetenteTipo == usuarioAutenticado.tipo);

        if (remetenteTipo == null) {
            remetenteTipo = remetenteEhUsuario ? usuarioAutenticado.tipo : tipoOposto(usuarioAutenticado.tipo);
        }
        if (destinatarioTipo == null) {
            destinatarioTipo = remetenteEhUsuario ? tipoOposto(usuarioAutenticado.tipo) : usuarioAutenticado.tipo;
        }

        dto.setEnviadaPeloUsuarioLogado(remetenteEhUsuario);
        dto.setRemetenteId(obterIdPlataforma(dto.getRemetenteId(), remetenteTipo));
        dto.setDestinatarioId(obterIdPlataforma(dto.getDestinatarioId(), destinatarioTipo));
        return dto;
    }

    private List<MensagemResponseDTO> converterListaParaPlataforma(List<MensagemResponseDTO> lista,
            UsuarioLocal usuarioAutenticado) {
        if (lista == null)
            return null;
        lista.forEach(dto -> converterParaPlataforma(dto, usuarioAutenticado));
        return lista;
    }

    @PostMapping
    public ResponseEntity<MensagemResponseDTO> enviarMensagem(
            Principal principal,
            @RequestBody Map<String, Object> dtoMap) {
        UsuarioLocal usuarioAutenticado = obterUsuarioLocalAutenticado(principal);
        Long localRemetenteId = usuarioAutenticado.id;
        Long platformDestinatarioId = dtoMap.get("destinatarioId") == null ? null
                : Long.valueOf(dtoMap.get("destinatarioId").toString());
        Long localDestinatarioId = obterIdLocal(platformDestinatarioId);
        String conteudo = dtoMap.get("conteudo") == null ? null : dtoMap.get("conteudo").toString();
        MensagemRequestDTO dto = new MensagemRequestDTO(localDestinatarioId, conteudo, null, null);
        MensagemResponseDTO mensagem = mensagemService.enviarMensagem(
                localRemetenteId,
                dto,
                usuarioAutenticado.tipo.name(),
                tipoOposto(usuarioAutenticado.tipo).name());
        return ResponseEntity.ok(converterParaPlataforma(mensagem, usuarioAutenticado));
    }

    @GetMapping
    public ResponseEntity<List<MensagemResponseDTO>> listarMensagens(Principal principal) {
        UsuarioLocal usuarioAutenticado = obterUsuarioLocalAutenticado(principal);
        Long localUsuarioId = usuarioAutenticado.id;
        List<MensagemResponseDTO> mensagens = mensagemService.listarMensagens(localUsuarioId);
        return ResponseEntity.ok(converterListaParaPlataforma(mensagens, usuarioAutenticado));
    }

    @GetMapping("/conversa/{usuarioId}")
    public ResponseEntity<List<MensagemResponseDTO>> buscarConversa(
            Principal principal,
            @PathVariable Long usuarioId) {
        UsuarioLocal usuarioAutenticado = obterUsuarioLocalAutenticado(principal);
        Long localUsuarioAutenticadoId = usuarioAutenticado.id;
        Long localUsuarioId = obterIdLocal(usuarioId);
        List<MensagemResponseDTO> mensagens = mensagemService.buscarConversa(localUsuarioAutenticadoId, localUsuarioId);
        return ResponseEntity.ok(converterListaParaPlataforma(mensagens, usuarioAutenticado));
    }

    @PostMapping("/media")
    public ResponseEntity<MensagemResponseDTO> enviarMensagemComMedia(
            Principal principal,
            @RequestParam("destinatarioId") Long destinatarioId,
            @RequestParam("file") MultipartFile file) throws Exception {
        UsuarioLocal usuarioAutenticado = obterUsuarioLocalAutenticado(principal);
        Long localRemetenteId = usuarioAutenticado.id;
        Long localDestinatarioId = obterIdLocal(destinatarioId);
        byte[] data = file.getBytes();
        String storageKey = java.util.UUID.randomUUID().toString();
        String mediaUrl = "/api/carehub/mensagens/media/" + storageKey;

        MensagemResponseDTO mensagem = mensagemService.enviarMensagem(localRemetenteId,
                new br.pucgo.ads.projetointegrador.carehub.dto.mensagem.MensagemRequestDTO(localDestinatarioId, null,
                        mediaUrl, file.getContentType()),
                usuarioAutenticado.tipo.name(),
                tipoOposto(usuarioAutenticado.tipo).name());

        try {
            br.pucgo.ads.projetointegrador.carehub.entity.MessageMedia mm = new br.pucgo.ads.projetointegrador.carehub.entity.MessageMedia();
            mm.setMensagemId(mensagem.getId());
            mm.setStorageKey(storageKey);
            mm.setMediaUrl(mediaUrl);
            mm.setContentType(file.getContentType());
            mm.setSizeBytes(file.getSize());
            mm.setData(data);
            messageMediaRepository.save(mm);
        } catch (Exception ex) {
            System.err.println("Aviso: falha ao salvar mídia: " + ex.getMessage());
        }

        return ResponseEntity.ok(converterParaPlataforma(mensagem, usuarioAutenticado));
    }

    @GetMapping("/media/{filename:.+}")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<Resource> serveMedia(Principal principal,
            @PathVariable String filename) throws Exception {
        Long localUsuarioId = obterIdLocalAutenticado(principal);
        br.pucgo.ads.projetointegrador.carehub.entity.MessageMedia mm = messageMediaRepository
                .findByStorageKey(filename);
        if (mm == null) {
            return ResponseEntity.notFound().build();
        }

        String mediaUrl = "/api/carehub/mensagens/media/" + filename;
        var maybe = mensagemRepository.findByMediaUrl(mediaUrl);
        if (maybe.isEmpty()) {
            return ResponseEntity.status(403).build();
        }
        var mensagem = maybe.get();
        mensagem = java.util.Objects.requireNonNull(mensagem);
        Long remetenteId = mensagem.getRemetenteId();
        Long destinatarioId = mensagem.getDestinatarioId();
        if (!localUsuarioId.equals(remetenteId) && !localUsuarioId.equals(destinatarioId)) {
            return ResponseEntity.status(403).build();
        }

        String rawContentType = mm.getContentType();
        if (rawContentType == null)
            rawContentType = "application/octet-stream";
        final String contentType = java.util.Objects.requireNonNull(rawContentType);

        byte[] dataBytes = java.util.Objects.requireNonNull(mm.getData());
        InputStreamResource resource = new InputStreamResource(new java.io.ByteArrayInputStream(dataBytes));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @GetMapping("/nao-lidas")
    public ResponseEntity<List<MensagemResponseDTO>> buscarNaoLidas(Principal principal) {
        UsuarioLocal usuarioAutenticado = obterUsuarioLocalAutenticado(principal);
        Long localDestinatarioId = usuarioAutenticado.id;
        List<MensagemResponseDTO> mensagens = mensagemService.buscarMensagensNaoLidas(localDestinatarioId);
        return ResponseEntity.ok(converterListaParaPlataforma(mensagens, usuarioAutenticado));
    }

    @PutMapping("/{id}/lida")
    public ResponseEntity<Void> marcarComoLida(@PathVariable Long id) {
        mensagemService.marcarComoLida(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/contador-nao-lidas")
    public ResponseEntity<Long> contarNaoLidas(Principal principal) {
        Long localUsuarioId = obterIdLocalAutenticado(principal);
        long count = mensagemService.contarMensagensNaoLidas(localUsuarioId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/contatos")
    public ResponseEntity<List<ContatoDTO>> listarContatos(Principal principal) {
        UsuarioLocal usuarioAutenticado = obterUsuarioLocalAutenticado(principal);
        boolean usuarioEhCuidador = usuarioAutenticado.tipo == TipoUsuario.CUIDADOR;
        TipoUsuario tipoContato = usuarioEhCuidador ? TipoUsuario.CLIENTE : TipoUsuario.CUIDADOR;

        List<ContatoDTO> contatos = mensagemService.listarContatos(usuarioAutenticado.id, usuarioEhCuidador);
        contatos.forEach(c -> {
            c.setId(obterIdPlataforma(c.getId(), tipoContato));
            if (c.getUltimoRemetenteId() != null) {
                // Calcula o booleano ANTES de converter o ID para platformId.
                // Usa IDs locais, que são sempre consistentes no banco CareHub —
                // sem risco de mismatch com platformUserId que pode estar nulo.
                boolean euEnviei = c.getUltimoRemetenteId().equals(usuarioAutenticado.id);
                c.setUltimaMensagemEnviadaPorMim(euEnviei);

                if (euEnviei) {
                    c.setUltimoRemetenteId(obterIdPlataforma(usuarioAutenticado.id, usuarioAutenticado.tipo));
                } else {
                    c.setUltimoRemetenteId(c.getId());
                }
            } else {
                // Sem última mensagem: campo indefinido (null = desconhecido)
                c.setUltimaMensagemEnviadaPorMim(null);
            }
        });
        return ResponseEntity.ok(contatos);
    }

    @PutMapping("/marcar-lidas/{remetenteId}")
    public ResponseEntity<Void> marcarConversaComoLida(
            @PathVariable Long remetenteId,
            Principal principal) {
        Long localUsuarioId = obterIdLocalAutenticado(principal);
        Long localRemetenteId = obterIdLocal(remetenteId);
        mensagemService.marcarConversaComoLida(localUsuarioId, localRemetenteId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Retorna se o chat com o usuário informado está ativo (permite enviar mensagens).
     * Ativo = existe agendamento PENDENTE, CONFIRMADO ou EM_ANDAMENTO entre as partes.
     */
    @GetMapping("/chat-ativo/{usuarioId}")
    public ResponseEntity<java.util.Map<String, Boolean>> verificarChatAtivo(
            Principal principal,
            @PathVariable Long usuarioId) {
        Long localUsuarioAutenticadoId = obterIdLocalAutenticado(principal);
        Long localUsuarioId = obterIdLocal(usuarioId);
        boolean ativo = mensagemService.chatAtivo(localUsuarioAutenticadoId, localUsuarioId);
        return ResponseEntity.ok(java.util.Map.of("ativo", ativo));
    }
}

