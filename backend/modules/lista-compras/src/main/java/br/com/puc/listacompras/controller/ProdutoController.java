package br.com.puc.listacompras.controller;

import br.com.puc.listacompras.dto.ProdutoRelacionadoResponseDTO;
import br.com.puc.listacompras.dto.ProdutoResponseDTO;
import br.com.puc.listacompras.dto.ProdutoSubstituivelResponseDTO;
import br.com.puc.listacompras.service.PatologiaItemService;
import br.com.puc.listacompras.service.ProdutoRelacionadoService;
import br.com.puc.listacompras.service.ProdutoService;
import br.com.puc.listacompras.utils.JwtClaimsUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Produtos", description = "Catalogo de produtos, relacionados e substituiveis por patologia.")
@RestController
@AllArgsConstructor
@RequestMapping("/api/lista-compras/produtos")
public class ProdutoController {

  private final ProdutoService produtoService;
  private final ProdutoRelacionadoService produtoRelacionadoService;
  private final PatologiaItemService patologiaItemService;

  @Operation(summary = "Listar produtos ativos", description = "Lista todos os produtos ativos do catalogo.")
  @GetMapping
  public ResponseEntity<List<ProdutoResponseDTO>> listarTodos() {
    return ResponseEntity.ok(produtoService.listarAtivos());
  }

  @Operation(summary = "Listar produtos relacionados", description = "Retorna produtos relacionados ordenados por afinidade.")
  @GetMapping("/{id}/relacionados")
  public ResponseEntity<List<ProdutoRelacionadoResponseDTO>> listarProdutosRelacionados(@PathVariable Long id) {
    return ResponseEntity.ok(produtoRelacionadoService.listarProdutosRelacionados(id));
  }

  @Operation(
      summary = "Listar substituiveis para o usuario autenticado",
      description = "Retorna produtos substitutos para o produto alertado conforme as patologias do usuario autenticado."
  )
  @GetMapping("/{id}/substituiveis")
  public ResponseEntity<List<ProdutoSubstituivelResponseDTO>> listarProdutosSubstituiveis(
      @RequestHeader(value = "Authorization") String authorization,
      @PathVariable Long id
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    return ResponseEntity.ok(patologiaItemService.listarProdutosSubstituiveis(usuarioId, id));
  }

  @Operation(
      summary = "Buscar produtos por nome",
      description = "Autocomplete: busca produtos por nome normalizado (sem acentos)."
  )
  @GetMapping("/buscar")
  public ResponseEntity<List<ProdutoResponseDTO>> buscarProdutos(@RequestParam String param) {
    return ResponseEntity.ok(produtoService.buscarPorNome(param));
  }

  @Operation(
      summary = "Listar substituiveis por patologia",
      description = "Retorna produtos substitutos cadastrados para uma patologia especifica (usado em templates)."
  )
  @GetMapping("/{id}/substituiveis-por-patologia")
  public ResponseEntity<List<ProdutoSubstituivelResponseDTO>> listarProdutosSubstituiveisPorPatologia(
      @PathVariable Long id,
      @RequestParam Long patologiaId
  ) {
    return ResponseEntity.ok(patologiaItemService.listarProdutosSubstituiveisPorPatologia(patologiaId, id));
  }
}
