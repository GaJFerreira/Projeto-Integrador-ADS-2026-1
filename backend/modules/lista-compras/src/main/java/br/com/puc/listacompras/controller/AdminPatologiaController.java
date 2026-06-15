package br.com.puc.listacompras.controller;

import br.com.puc.listacompras.dto.PatologiaResponseDTO;
import br.com.puc.listacompras.dto.admin.AdminPatologiaRequestDTO;
import br.com.puc.listacompras.service.AdminPatologiaService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin Patologias", description = "Gerenciamento administrativo de patologias e vinculos com usuarios.")
@RestController
@AllArgsConstructor
@RequestMapping("/api/lista-compras/admin/patologias")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPatologiaController {

  private final AdminPatologiaService service;

  @Operation(summary = "Listar todas as patologias cadastradas")
  @GetMapping
  public ResponseEntity<List<PatologiaResponseDTO>> listarTodas() {
    return ResponseEntity.ok(service.listarTodas());
  }

  @Operation(summary = "Cadastrar nova patologia")
  @PostMapping
  public ResponseEntity<PatologiaResponseDTO> criar(@Valid @RequestBody AdminPatologiaRequestDTO dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
  }

  @Operation(summary = "Atualizar patologia existente")
  @PutMapping("/{id}")
  public ResponseEntity<PatologiaResponseDTO> atualizar(
      @PathVariable Long id,
      @Valid @RequestBody AdminPatologiaRequestDTO dto) {
    return ResponseEntity.ok(service.atualizar(id, dto));
  }

  @Operation(summary = "Excluir patologia")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> excluir(@PathVariable Long id) {
    service.excluir(id);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Listar IDs de usuarios vinculados a esta patologia")
  @GetMapping("/{id}/usuarios")
  public ResponseEntity<List<Long>> listarUsuarios(@PathVariable Long id) {
    return ResponseEntity.ok(service.listarUsuariosDaPatologia(id));
  }

  @Operation(summary = "Vincular usuario a uma patologia")
  @PostMapping("/{id}/usuarios/{usuarioId}")
  public ResponseEntity<Void> vincularUsuario(
      @PathVariable Long id,
      @PathVariable Long usuarioId) {
    service.vincularUsuario(id, usuarioId);
    return ResponseEntity.status(HttpStatus.CREATED).build();
  }

  @Operation(summary = "Desvincular usuario de uma patologia")
  @DeleteMapping("/{id}/usuarios/{usuarioId}")
  public ResponseEntity<Void> desvincularUsuario(
      @PathVariable Long id,
      @PathVariable Long usuarioId) {
    service.desvincularUsuario(id, usuarioId);
    return ResponseEntity.noContent().build();
  }
}
