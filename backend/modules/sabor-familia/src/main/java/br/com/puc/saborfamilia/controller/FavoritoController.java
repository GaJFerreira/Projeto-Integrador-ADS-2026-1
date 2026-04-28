package br.com.puc.saborfamilia.controller;

import br.com.puc.saborfamilia.service.favorito.FavoritoService;
import br.com.puc.saborfamilia.service.favorito.dto.FavoritoResponse;
import br.com.puc.saborfamilia.service.receita.ReceitaService;
import br.com.puc.saborfamilia.service.receita.dto.response.ReceitaResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
@RequestMapping(value = "/receita")
@Tag(name = "Favorito", description = "Serviços para favoritar receitas e listar favoritos do usuário.")
public class FavoritoController {

  private final FavoritoService favoritoService;
  private final ReceitaService receitaService;

  @GetMapping(value = "/favoritos")
  @Operation(
    summary = "Listar receitas favoritas do usuário",
    description = "Retorna as receitas que o perfil do usuário tem como favorita."
  )
  public ResponseEntity<Page<ReceitaResponse>> buscarReceitasFavoritas(
    @RequestHeader(value = "X-User-Id") Long usuarioId,
    @PageableDefault(size = 20, sort = "dataCadastro", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Page<ReceitaResponse> response = receitaService.buscarReceitasFavoritas(usuarioId, pageable);
    return ResponseEntity.ok(response);
  }

  @PostMapping(value = "/{receitaId}/favoritos")
  @Operation(
    summary = "Favoritar uma receita",
    description = "Adiciona a receita à lista de favoritos do perfil do usuário."
  )
  public ResponseEntity<FavoritoResponse> adicionarReceitaFavoritar(
    @RequestHeader(value = "X-User-Id") Long usuarioId,
    @PathVariable Long receitaId
  ) {
    FavoritoResponse response = favoritoService.adicionarReceitaFavoritar(usuarioId, receitaId);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping(value = "/{receitaId}/favoritos")
  @Operation(
    summary = "Desfavoritar uma receita",
    description = "Remove a receita da lista de favoritos do perfil do usuário."
  )
  public ResponseEntity<FavoritoResponse> removerReceitaFavorita(
    @RequestHeader(value = "X-User-Id") Long usuarioId,
    @PathVariable Long receitaId
  ) {
    FavoritoResponse response = favoritoService.removerReceitaFavorita(usuarioId, receitaId);
    return ResponseEntity.ok(response);
  }

}
