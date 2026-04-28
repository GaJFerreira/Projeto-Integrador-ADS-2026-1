package br.com.puc.saborfamilia.controller;

import br.com.puc.saborfamilia.service.receita.ReceitaService;
import br.com.puc.saborfamilia.service.receita.dto.request.ReceitaRequest;
import br.com.puc.saborfamilia.service.receita.dto.response.ReceitaResponse;
import br.com.puc.saborfamilia.service.receita.dto.response.ReceitaResumoResponse;
import br.com.puc.saborfamilia.service.receita.dto.response.RemoverReceitaResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping(value = "/receita")
@Tag(name = "Receita", description = "Serviços para gerenciamento de receitas da aplicação.")
public class ReceitaController {

  private final ReceitaService receitaService;

  @GetMapping(value = "/feed")
  @Operation(
    summary = "Feed personalizado",
    description = "Retorna receitas do usuário e dos perfis que ele segue."
  )
  public ResponseEntity<Page<ReceitaResponse>> feedPersonalizado(
    @RequestHeader(value = "X-User-Id") Long usuarioId,
    @PageableDefault(sort = "dataCadastro", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Page<ReceitaResponse> response = receitaService.feedPersonalizado(usuarioId, pageable);
    return ResponseEntity.ok(response);
  }

  @GetMapping(value = "/explorar")
  @Operation(
    summary = "Explorar receitas",
    description = "Retorna receitas em formato resumido de forma paginada."
  )
  public ResponseEntity<Page<ReceitaResumoResponse>> explorarReceitas(
    @RequestHeader(value = "X-User-Id") Long usuarioId,
    @RequestParam(value = "titulo", required = false) String titulo,
    @RequestParam(value = "tipoRefeicao", required = false) String tipoRefeicao,
    Pageable pageable
  ) {
    pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
    Page<ReceitaResumoResponse> response = receitaService.explorarReceitas(usuarioId, titulo, tipoRefeicao, pageable);
    return ResponseEntity.ok(response);
  }

  @GetMapping(value = "/perfil/{perfilId}")
  @Operation(
    summary = "Listar receitas de um perfil",
    description = "Retorna as receitas publicadas pelo perfil informado de forma paginada."
  )
  public ResponseEntity<Page<ReceitaResumoResponse>> buscarReceitasPerfil(
    @RequestHeader(value = "X-User-Id") Long usuarioId,
    @PathVariable Long perfilId,
    @PageableDefault(sort = "dataCadastro", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Page<ReceitaResumoResponse> response = receitaService.buscarReceitasPerfil(usuarioId, perfilId, pageable);
    return ResponseEntity.ok(response);
  }

  @GetMapping(value = "/{id}")
  @Operation(
    summary = "Buscar detalhes de uma receita",
    description = "Busca uma determinada receita específica pelo ID."
  )
  public ResponseEntity<ReceitaResponse> buscarReceita(
    @RequestHeader(value = "X-User-Id") Long usuarioId,
    @PathVariable Long id
  ) {
    ReceitaResponse response = receitaService.buscarReceita(usuarioId, id);
    return ResponseEntity.ok(response);
  }

  @PostMapping
  @Operation(
    summary = "Criar uma nova receita",
    description = "Cria uma nova receita para o perfil associado ao usuário."
  )
  public ResponseEntity<ReceitaResponse> criarReceita(
    @RequestHeader(value = "X-User-Id") Long usuarioId,
    @Valid @RequestBody ReceitaRequest request
  ) {
    ReceitaResponse response = receitaService.criarReceita(usuarioId, request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PutMapping(value = "/{id}")
  @Operation(
    summary = "Editar uma receita existente",
    description = "Editar os dados de uma receita já cadastrada."
  )
  public ResponseEntity<ReceitaResponse> editarReceita(
    @RequestHeader(value = "X-User-Id") Long usuarioId,
    @PathVariable Long id,
    @Valid @RequestBody ReceitaRequest request
  ) {
    ReceitaResponse response = receitaService.editarReceita(usuarioId, id, request);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping(value = "/{id}")
  @Operation(
    summary = "Remover uma receita",
    description = "Remove uma receita existente do usuário autor."
  )
  public ResponseEntity<RemoverReceitaResponse> removerReceita(
    @RequestHeader(value = "X-User-Id") Long usuarioId,
    @PathVariable Long id
  ) {
    RemoverReceitaResponse response = receitaService.removerReceita(usuarioId, id);
    return ResponseEntity.ok(response);
  }

}


