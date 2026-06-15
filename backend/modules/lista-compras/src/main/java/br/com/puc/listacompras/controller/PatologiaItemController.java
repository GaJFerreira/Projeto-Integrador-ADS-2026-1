package br.com.puc.listacompras.controller;

import br.com.puc.listacompras.dto.PatologiaItemRequestDTO;
import br.com.puc.listacompras.dto.PatologiaItemResponseDTO;
import br.com.puc.listacompras.service.PatologiaItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Patologia Itens", description = "Vinculos entre produtos e patologias com sugestao de substituicao.")
@RestController
@AllArgsConstructor
@RequestMapping("/api/lista-compras/patologia-itens")
public class PatologiaItemController {

  private final PatologiaItemService service;

  @Operation(summary = "Vincular produto a patologia (com sugestao opcional)")
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping
  public ResponseEntity<PatologiaItemResponseDTO> vincular(@Valid @RequestBody PatologiaItemRequestDTO dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.vincular(dto));
  }

  @Operation(summary = "Listar vinculos por patologia")
  @GetMapping("/patologia/{patologiaId}")
  public ResponseEntity<List<PatologiaItemResponseDTO>> listarPorPatologia(@PathVariable Long patologiaId) {
    return ResponseEntity.ok(service.listarPorPatologia(patologiaId));
  }

  @Operation(summary = "Remover vinculo produto-patologia")
  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> desvincular(@PathVariable Long id) {
    service.desvincular(id);
    return ResponseEntity.noContent().build();
  }
}
