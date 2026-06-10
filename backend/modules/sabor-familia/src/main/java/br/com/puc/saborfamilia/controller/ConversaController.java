package br.com.puc.saborfamilia.controller;

import br.com.puc.saborfamilia.utils.JwtClaimsUtils;
import br.com.puc.saborfamilia.service.mensagem.MensagemService;
import br.com.puc.saborfamilia.service.mensagem.dto.request.EnviarMensagemRequest;
import br.com.puc.saborfamilia.service.mensagem.dto.response.ConversaResponse;
import br.com.puc.saborfamilia.service.mensagem.dto.response.EnviarMensagemResponse;
import br.com.puc.saborfamilia.service.mensagem.dto.response.MensagemCursorResponse;
import br.com.puc.saborfamilia.service.mensagem.dto.response.RemoverMensagemResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping(value = "/api/sabor-familia/conversa")
@Tag(name = "Conversa", description = "Serviços para conversas e mensagens entre perfis.")
public class ConversaController {

  private final MensagemService mensagemService;

  @GetMapping
  @Operation(
    summary = "Listar conversas",
    description = "Retorna a lista de conversas do usuário de forma paginada."
  )
  public ResponseEntity<Page<ConversaResponse>> buscarConversas(
    @RequestHeader(value = "Authorization") String authorization,
    @PageableDefault(sort = "dataEnvioUltimaMensagem", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    Page<ConversaResponse> response = mensagemService.buscarConversas(usuarioId, pageable);
    return ResponseEntity.ok(response);
  }

  @GetMapping(value = "/{conversaId}/mensagens")
  @Operation(
    summary = "Listar mensagens da conversa",
    description = "Retorna o histórico de mensagens da conversa de forma paginada."
  )
  public ResponseEntity<MensagemCursorResponse> buscarMensagensConversa(
    @RequestHeader(value = "Authorization") String authorization,
    @PathVariable Long conversaId,
    @RequestParam(required = false) Integer limit,
    @RequestParam(required = false) Long before
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    MensagemCursorResponse response = mensagemService.buscarMensagensConversa(usuarioId, conversaId, limit, before);
    return ResponseEntity.ok(response);
  }

  @PostMapping(value = "/mensagens")
  @Operation(
    summary = "Enviar mensagem",
    description = "Envia uma mensagem para o destinatário."
  )
  public ResponseEntity<EnviarMensagemResponse> enviarMensagem(
    @RequestHeader(value = "Authorization") String authorization,
    @Valid @RequestBody EnviarMensagemRequest request
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    EnviarMensagemResponse response = mensagemService.enviarMensagem(usuarioId, request);
    return ResponseEntity.ok(response);
  }

  @PatchMapping(value = "/{conversaId}/marcar-lida")
  @Operation(
    summary = "Marcar conversa como lida",
    description = "Marca como lidas as mensagens recebidas pelo usuário."
  )
  public ResponseEntity<Void> marcarConversaComoLida(
    @RequestHeader(value = "Authorization") String authorization,
    @PathVariable Long conversaId
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    mensagemService.marcarConversaComoLida(usuarioId, conversaId);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping(value = "/mensagens/{mensagemId}")
  @Operation(
    summary = "Apagar mensagem",
    description = "Define uma mensagem como apagada. Apenas o remetente pode apagar."
  )
  public ResponseEntity<RemoverMensagemResponse> removerMensagem(
    @RequestHeader(value = "Authorization") String authorization,
    @PathVariable Long mensagemId
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    RemoverMensagemResponse response = mensagemService.removerMensagem(usuarioId, mensagemId);
    return ResponseEntity.ok(response);
  }

}
