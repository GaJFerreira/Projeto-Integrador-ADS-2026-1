package br.com.puc.saborfamilia.controller;

import br.com.puc.saborfamilia.service.curtida.CurtidaService;
import br.com.puc.saborfamilia.service.curtida.dto.CurtidaResponse;
import br.com.puc.saborfamilia.service.receita.dto.response.PerfilCurtidaResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping(value = "/api/sabor-familia/receita")
@Tag(name = "Curtida", description = "Serviços para gerenciar curtidas das receitas.")
public class CurtidaController {

  private final CurtidaService curtidaService;

  @GetMapping(value = "/{receitaId}/curtidas")
  @Operation(
    summary = "Listar perfis que curtiram uma receita",
    description = "Retorna a lista de perfis que curtiram a receita informada."
  )
  public ResponseEntity<List<PerfilCurtidaResponse>> buscarPerfilCurtidasReceita(
    @PathVariable Long receitaId
  ) {
    List<PerfilCurtidaResponse> response = curtidaService.buscarPerfilCurtidasReceita(receitaId);
    return ResponseEntity.ok(response);
  }

  @PostMapping(value = "/{receitaId}/curtidas")
  @Operation(
    summary = "Curtir uma receita",
    description = "Registra uma curtida do perfil do usuário na receita informada."
  )
  public ResponseEntity<CurtidaResponse> adicionarCurtidaReceita(
    @RequestHeader(value = "X-User-Id") Long usuarioId,
    @PathVariable Long receitaId
  ) {
    CurtidaResponse response = curtidaService.adicionarCurtidaReceita(usuarioId, receitaId);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping(value = "/{receitaId}/curtidas")
  @Operation(
    summary = "Remover curtida de uma receita",
    description = "Remove a curtida do perfil do usuário na receita informada, caso exista."
  )
  public ResponseEntity<CurtidaResponse> removerCurtidaReceita(
    @RequestHeader(value = "X-User-Id") Long usuarioId,
    @PathVariable Long receitaId
  ) {
    CurtidaResponse response = curtidaService.removerCurtidaReceita(usuarioId, receitaId);
    return ResponseEntity.ok(response);
  }

}
