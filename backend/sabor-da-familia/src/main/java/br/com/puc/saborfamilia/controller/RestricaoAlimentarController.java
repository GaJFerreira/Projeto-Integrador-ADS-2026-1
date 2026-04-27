package br.com.puc.saborfamilia.controller;

import br.com.puc.saborfamilia.service.restricao.RestricaoAlimentarService;
import br.com.puc.saborfamilia.service.restricao.dto.RestricaoAlimentarResponse;
import br.com.puc.saborfamilia.service.restricao.dto.request.EditarRestricaoAlimentarRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping(value = "/restricao-alimentar")
@Tag(name = "Restrição alimentar", description = "Catálogo de restrições alimentares, edição e alteração de status.")
public class RestricaoAlimentarController {

  private final RestricaoAlimentarService restricaoAlimentarService;

  @GetMapping
  @Operation(
    summary = "Listar restrições alimentares ativas",
    description = "Retorna o catálogo de restrições com status ATIVO (uso em formulários de perfil e receita)."
  )
  public ResponseEntity<List<RestricaoAlimentarResponse>> buscarRestricoesAlimentares() {
    List<RestricaoAlimentarResponse> response = restricaoAlimentarService.buscarRestricoesAlimentares();
    return ResponseEntity.ok(response);
  }

  @GetMapping(value = "/{codigo}")
  @Operation(
    summary = "Buscar restrição alimentar ativa",
    description = "Retorna uma restrição pelo código."
  )
  public ResponseEntity<RestricaoAlimentarResponse> buscarRestricaoAlimentar(@PathVariable String codigo) {
    RestricaoAlimentarResponse response = restricaoAlimentarService.buscarRestricaoAlimentar(codigo);
    return ResponseEntity.ok(response);
  }

  @PutMapping(value = "/{codigo}")
  @Operation(
    summary = "Editar restrição alimentar",
    description = "Atualiza textos da restrição já cadastrada."
  )
  public ResponseEntity<RestricaoAlimentarResponse> editarRestricaoAlimentar(
    @PathVariable String codigo,
    @RequestBody EditarRestricaoAlimentarRequest request
  ) {
    RestricaoAlimentarResponse response = restricaoAlimentarService.editarRestricaoAlimentar(codigo, request);
    return ResponseEntity.ok(response);
  }

  @PatchMapping(value = "/ativar/{codigo}")
  @Operation(
    summary = "Ativar restrição alimentar",
    description = "Define o status da restrição como ATIVO."
  )
  public ResponseEntity<RestricaoAlimentarResponse> ativarRestricaoAlimentar(@PathVariable String codigo) {
    RestricaoAlimentarResponse response = restricaoAlimentarService.ativarRestricaoAlimentar(codigo);
    return ResponseEntity.ok(response);
  }

  @PatchMapping(value = "/inativar/{codigo}")
  @Operation(
    summary = "Inativar restrição alimentar",
    description = "Define o status da restrição como INATIVO."
  )
  public ResponseEntity<RestricaoAlimentarResponse> inativarRestricaoAlimentar(@PathVariable String codigo) {
    RestricaoAlimentarResponse response = restricaoAlimentarService.inativarRestricaoAlimentar(codigo);
    return ResponseEntity.ok(response);
  }

}
