package br.com.puc.saborfamilia.controller;

import br.com.puc.saborfamilia.utils.JwtClaimsUtils;
import br.com.puc.saborfamilia.service.perfil.PerfilService;
import br.com.puc.saborfamilia.service.perfil.dto.request.PerfilRequest;
import br.com.puc.saborfamilia.service.perfil.dto.request.EditarPerfilRequest;
import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResumoResponse;
import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResponse;
import br.com.puc.saborfamilia.service.seguindo.SeguindoService;
import br.com.puc.saborfamilia.service.seguindo.dto.SeguindoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping(value = "/api/sabor-familia/perfil")
@Tag(name = "Perfil", description = "Serviços para gerenciamento de perfis da aplicação.")
public class PerfilController {

  private final PerfilService perfilService;
  private final SeguindoService seguindoService;

  @GetMapping
  @Operation(
    summary = "Buscar meu perfil",
    description = "Busca os dados do perfil associado ao usuário informado."
  )
  public ResponseEntity<PerfilResponse> buscarMeuPerfil(
    @RequestHeader(value = "Authorization") String authorization
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    PerfilResponse response = perfilService.buscarMeuPerfil(usuarioId);
    return ResponseEntity.ok(response);
  }

  @GetMapping(value = "/{perfilId}")
  @Operation(
    summary = "Buscar perfil público",
    description = "Busca os dados de um perfil público."
  )
  public ResponseEntity<PerfilResponse> buscarPerfilPublico(
    @RequestHeader(value = "Authorization") String authorization,
    @PathVariable Long perfilId
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    PerfilResponse response = perfilService.buscarPerfilPublico(usuarioId, perfilId);
    return ResponseEntity.ok(response);
  }

  @PostMapping
  @Operation(
    summary = "Criar perfil do usuário",
    description = "Cria um novo perfil para o usuário informado."
  )
  public ResponseEntity<PerfilResponse> criarPerfil(
    @RequestHeader(value = "Authorization") String authorization,
    @Valid @RequestBody PerfilRequest request
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    PerfilResponse response = perfilService.criarPerfil(usuarioId, request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PutMapping
  @Operation(
    summary = "Atualizar perfil do usuário",
    description = "Atualizar o perfil existente de um usuário autenticado."
  )
  public ResponseEntity<PerfilResponse> editarPerfil(
    @RequestHeader(value = "Authorization") String authorization,
    @Valid @RequestBody EditarPerfilRequest request
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    PerfilResponse response = perfilService.editarPerfil(usuarioId, request);
    return ResponseEntity.ok(response);
  }

  @GetMapping(value = "/{perfilId}/seguidores")
  @Operation(
    summary = "Listar seguidores do perfil",
    description = "Retorna a lista paginada de perfis que seguem o perfil informado."
  )
  public ResponseEntity<Page<PerfilResumoResponse>> buscarSeguidores(
    @RequestHeader(value = "Authorization") String authorization,
    @PathVariable Long perfilId,
    @PageableDefault(size = 20) Pageable pageable
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    Page<PerfilResumoResponse> response = seguindoService.buscarSeguidores(perfilId, usuarioId, pageable);
    return ResponseEntity.ok(response);
  }

  @GetMapping(value = "/{perfilId}/seguindo")
  @Operation(
    summary = "Listar quem o perfil segue",
    description = "Retorna a lista paginada de perfis que o perfil informado segue."
  )
  public ResponseEntity<Page<PerfilResumoResponse>> buscarSeguindo(
    @RequestHeader(value = "Authorization") String authorization,
    @PathVariable Long perfilId,
    @PageableDefault(size = 20) Pageable pageable
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    Page<PerfilResumoResponse> response = seguindoService.buscarSeguindo(perfilId, usuarioId, pageable);
    return ResponseEntity.ok(response);
  }

  @PostMapping(value = "/{perfilId}/seguir")
  @Operation(
    summary = "Seguir perfil",
    description = "Começa a seguir o perfil informado."
  )
  public ResponseEntity<SeguindoResponse> seguirPerfil(
    @RequestHeader(value = "Authorization") String authorization,
    @PathVariable Long perfilId
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    SeguindoResponse response = seguindoService.seguirPerfil(usuarioId, perfilId);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping(value = "/{perfilId}/seguir")
  @Operation(
    summary = "Deixar de seguir perfil",
    description = "Para de seguir o perfil informado."
  )
  public ResponseEntity<SeguindoResponse> deixarSeguirPerfil(
    @RequestHeader(value = "Authorization") String authorization,
    @PathVariable Long perfilId
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    SeguindoResponse response = seguindoService.deixarSeguirPerfil(usuarioId, perfilId);
    return ResponseEntity.ok(response);
  }

}

