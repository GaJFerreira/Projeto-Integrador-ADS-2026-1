package br.pucgo.ads.projetointegrador.carehub.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.Map;
import java.util.List;

import br.pucgo.ads.projetointegrador.carehub.dto.mensagem.ContatoDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.mensagem.MensagemRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.mensagem.MensagemResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.service.MensagemService;

@RestController
@RequestMapping("/api/carehub/mensagens")
public class MensagemController {

    @Autowired
    private MensagemService mensagemService;
    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.CareHubMensagemRepository mensagemRepository;
    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.MessageMediaRepository messageMediaRepository;

    @Autowired
    private br.pucgo.ads.projetointegrador.carehub.repository.CareHubUsuarioRepository careHubUsuarioRepository;

    private Long obterIdLocal(Long platformUserId) {
        if (platformUserId == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "X-User-Id header é obrigatório");
        }
        return careHubUsuarioRepository.findByPlatformUserId(platformUserId)
                .map(br.pucgo.ads.projetointegrador.carehub.entity.Usuario::getId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND,
                        "Usuário local do CareHub não encontrado para o platformUserId: " + platformUserId));
    }

    private Long obterIdPlataforma(Long localUserId) {
        if (localUserId == null)
            return null;
        return careHubUsuarioRepository.findById(localUserId)
                .map(br.pucgo.ads.projetointegrador.carehub.entity.Usuario::getPlatformUserId)
                .orElse(localUserId);
    }

    private MensagemResponseDTO converterParaPlataforma(MensagemResponseDTO dto) {
        if (dto == null)
            return null;
        dto.setRemetenteId(obterIdPlataforma(dto.getRemetenteId()));
        dto.setDestinatarioId(obterIdPlataforma(dto.getDestinatarioId()));
        return dto;
    }

    private List<MensagemResponseDTO> converterListaParaPlataforma(List<MensagemResponseDTO> lista) {
        if (lista == null)
            return null;
        lista.forEach(this::converterParaPlataforma);
        return lista;
    }

    @PostMapping
    public ResponseEntity<MensagemResponseDTO> enviarMensagem(
            @RequestHeader("X-User-Id") Long remetenteId,
            @RequestBody Map<String, Object> dtoMap) {
        Long localRemetenteId = obterIdLocal(remetenteId);
        Long platformDestinatarioId = dtoMap.get("destinatarioId") == null ? null
                : Long.valueOf(dtoMap.get("destinatarioId").toString());
        Long localDestinatarioId = obterIdLocal(platformDestinatarioId);
        String conteudo = dtoMap.get("conteudo") == null ? null : dtoMap.get("conteudo").toString();
        MensagemRequestDTO dto = new MensagemRequestDTO(localDestinatarioId, conteudo, null, null);
        MensagemResponseDTO mensagem = mensagemService.enviarMensagem(localRemetenteId, dto);
        return ResponseEntity.ok(converterParaPlataforma(mensagem));
    }

    @GetMapping
    public ResponseEntity<List<MensagemResponseDTO>> listarMensagens(
            @RequestHeader("X-User-Id") Long usuarioId) {
        Long localUsuarioId = obterIdLocal(usuarioId);
        List<MensagemResponseDTO> mensagens = mensagemService.listarMensagens(localUsuarioId);
        return ResponseEntity.ok(converterListaParaPlataforma(mensagens));
    }

    @GetMapping("/conversa/{usuarioId}")
    public ResponseEntity<List<MensagemResponseDTO>> buscarConversa(
            @RequestHeader("X-User-Id") Long usuarioAutenticadoId,
            @PathVariable Long usuarioId) {
        Long localUsuarioAutenticadoId = obterIdLocal(usuarioAutenticadoId);
        Long localUsuarioId = obterIdLocal(usuarioId);
        List<MensagemResponseDTO> mensagens = mensagemService.buscarConversa(localUsuarioAutenticadoId, localUsuarioId);
        return ResponseEntity.ok(converterListaParaPlataforma(mensagens));
    }

    @PostMapping("/media")
    public ResponseEntity<MensagemResponseDTO> enviarMensagemComMedia(
            @RequestHeader("X-User-Id") Long remetenteId,
            @RequestParam("destinatarioId") Long destinatarioId,
            @RequestParam("file") MultipartFile file) throws Exception {
        Long localRemetenteId = obterIdLocal(remetenteId);
        Long localDestinatarioId = obterIdLocal(destinatarioId);
        // read bytes and store in DB as blob
        byte[] data = file.getBytes();
        String storageKey = java.util.UUID.randomUUID().toString();
        String mediaUrl = "/api/carehub/mensagens/media/" + storageKey;

        // create message using existing service (persist message with mediaUrl, no text
        // content for audio)
        MensagemResponseDTO mensagem = mensagemService.enviarMensagem(localRemetenteId,
                new br.pucgo.ads.projetointegrador.carehub.dto.mensagem.MensagemRequestDTO(localDestinatarioId, null,
                        mediaUrl, file.getContentType()));

        // Persist media blob in DB
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
            System.err.println("Warning: failed to save media blob: " + ex.getMessage());
        }

        return ResponseEntity.ok(converterParaPlataforma(mensagem));
    }

    @GetMapping("/media/{filename:.+}")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<Resource> serveMedia(@RequestHeader("X-User-Id") Long usuarioId,
            @PathVariable String filename) throws Exception {
        Long localUsuarioId = obterIdLocal(usuarioId);
        // Look up media in DB by storageKey
        br.pucgo.ads.projetointegrador.carehub.entity.MessageMedia mm = messageMediaRepository
                .findByStorageKey(filename);
        if (mm == null) {
            return ResponseEntity.notFound().build();
        }

        // Verify that the requesting user is either remetente or destinatario of the
        // message that references this media
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

        // Garantir que o contentType seja não-nulo para satisfazer o analisador de
        // null-safety
        String rawContentType = mm.getContentType();
        if (rawContentType == null)
            rawContentType = "application/octet-stream";
        final String contentType = java.util.Objects.requireNonNull(rawContentType);

        // garantir não-nulidade dos bytes antes de construir o resource
        byte[] dataBytes = java.util.Objects.requireNonNull(mm.getData());
        InputStreamResource resource = new InputStreamResource(new java.io.ByteArrayInputStream(dataBytes));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @GetMapping("/nao-lidas")
    public ResponseEntity<List<MensagemResponseDTO>> buscarNaoLidas(
            @RequestHeader("X-User-Id") Long destinatarioId) {
        Long localDestinatarioId = obterIdLocal(destinatarioId);
        List<MensagemResponseDTO> mensagens = mensagemService.buscarMensagensNaoLidas(localDestinatarioId);
        return ResponseEntity.ok(converterListaParaPlataforma(mensagens));
    }

    @PutMapping("/{id}/lida")
    public ResponseEntity<Void> marcarComoLida(@PathVariable Long id) {
        mensagemService.marcarComoLida(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/contador-nao-lidas")
    public ResponseEntity<Long> contarNaoLidas(@RequestHeader("X-User-Id") Long usuarioId) {
        Long localUsuarioId = obterIdLocal(usuarioId);
        long count = mensagemService.contarMensagensNaoLidas(localUsuarioId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/contatos")
    public ResponseEntity<List<ContatoDTO>> listarContatos(@RequestHeader("X-User-Id") Long usuarioId) {
        Long localUsuarioId = obterIdLocal(usuarioId);
        List<ContatoDTO> contatos = mensagemService.listarContatos(localUsuarioId);
        contatos.forEach(c -> c.setId(obterIdPlataforma(c.getId())));
        return ResponseEntity.ok(contatos);
    }

    @PutMapping("/marcar-lidas/{remetenteId}")
    public ResponseEntity<Void> marcarConversaComoLida(
            @PathVariable Long remetenteId,
            @RequestHeader("X-User-Id") Long usuarioId) {
        Long localUsuarioId = obterIdLocal(usuarioId);
        Long localRemetenteId = obterIdLocal(remetenteId);
        mensagemService.marcarConversaComoLida(localUsuarioId, localRemetenteId);
        return ResponseEntity.noContent().build();
    }
}
