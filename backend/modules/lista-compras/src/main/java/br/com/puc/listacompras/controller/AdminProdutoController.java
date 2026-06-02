package br.com.puc.listacompras.controller;

import br.com.puc.listacompras.dto.admin.AdminProdutoRequestDTO;
import br.com.puc.listacompras.dto.admin.AdminProdutoResponseDTO;
import br.com.puc.listacompras.dto.admin.AdminProdutoUpdateCustoDTO;
import br.com.puc.listacompras.dto.admin.AdminProdutoUpdateNutricaoDTO;
import br.com.puc.listacompras.service.AdminProdutoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(
    name = "Admin Produtos",
    description = "Cadastro administrativo de produtos do catalogo (nutricao e custo medio)."
)
@RestController
@AllArgsConstructor
@RequestMapping("/api/lista-compras/admin/produtos")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProdutoController {

  private final AdminProdutoService adminProdutoService;

  @Operation(summary = "Listar todos os produtos (inclusive inativos)")
  @GetMapping
  public ResponseEntity<List<AdminProdutoResponseDTO>> listarTodos() {
    return ResponseEntity.ok(adminProdutoService.listarTodos());
  }

  @Operation(summary = "Buscar produto por ID")
  @GetMapping("/{id}")
  public ResponseEntity<AdminProdutoResponseDTO> buscarPorId(@PathVariable Long id) {
    return ResponseEntity.ok(adminProdutoService.buscarPorId(id));
  }

  @Operation(summary = "Cadastrar produto novo (com nutricao e custo medio)")
  @PostMapping
  public ResponseEntity<AdminProdutoResponseDTO> criar(@Valid @RequestBody AdminProdutoRequestDTO dto) {
    return ResponseEntity.ok(adminProdutoService.criar(dto));
  }

  @Operation(summary = "Atualizar produto completo")
  @PutMapping("/{id}")
  public ResponseEntity<AdminProdutoResponseDTO> atualizar(
      @PathVariable Long id,
      @Valid @RequestBody AdminProdutoRequestDTO dto
  ) {
    return ResponseEntity.ok(adminProdutoService.atualizar(id, dto));
  }

  @Operation(summary = "Atualizar somente o custo medio do produto")
  @PatchMapping("/{id}/custo")
  public ResponseEntity<AdminProdutoResponseDTO> atualizarCusto(
      @PathVariable Long id,
      @Valid @RequestBody AdminProdutoUpdateCustoDTO dto
  ) {
    return ResponseEntity.ok(adminProdutoService.atualizarCusto(id, dto));
  }

  @Operation(summary = "Atualizar somente a tabela nutricional do produto")
  @PatchMapping("/{id}/nutricao")
  public ResponseEntity<AdminProdutoResponseDTO> atualizarNutricao(
      @PathVariable Long id,
      @Valid @RequestBody AdminProdutoUpdateNutricaoDTO dto
  ) {
    return ResponseEntity.ok(adminProdutoService.atualizarNutricao(id, dto));
  }

  @Operation(summary = "Desativar produto (soft delete: ativo=false)")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> desativar(@PathVariable Long id) {
    adminProdutoService.desativar(id);
    return ResponseEntity.noContent().build();
  }
}
