package br.com.puc.listacompras.controller;

import br.com.puc.listacompras.dto.CategoriaResponseDTO;
import br.com.puc.listacompras.service.CategoriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Categorias", description = "Catalogo de categorias de produtos.")
@RestController
@AllArgsConstructor
@RequestMapping("/api/lista-compras/categorias")
public class CategoriaController {

  private final CategoriaService categoriaService;

  @Operation(summary = "Listar todas as categorias")
  @GetMapping
  public ResponseEntity<List<CategoriaResponseDTO>> listarTodas() {
    return ResponseEntity.ok(categoriaService.listarTodas());
  }

  @Operation(summary = "Buscar categoria por ID")
  @GetMapping("/{id}")
  public ResponseEntity<CategoriaResponseDTO> buscarPorId(@PathVariable Long id) {
    return ResponseEntity.ok(categoriaService.buscarPorId(id));
  }
}
