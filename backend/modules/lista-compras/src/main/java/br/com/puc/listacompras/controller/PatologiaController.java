package br.com.puc.listacompras.controller;

import br.com.puc.listacompras.dto.PatologiaResponseDTO;
import br.com.puc.listacompras.service.PatologiaService;
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
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Patologias", description = "Patologias do usuario e detalhes por ID.")
@RestController
@AllArgsConstructor
@RequestMapping("/api/lista-compras/patologias")
public class PatologiaController {

  private final PatologiaService patologiaService;

  @Operation(
      summary = "Listar patologias do usuario autenticado",
      description = "Retorna as patologias associadas ao usuario que esta autenticado."
  )
  @GetMapping
  public ResponseEntity<List<PatologiaResponseDTO>> listarDoUsuario(
      @RequestHeader(value = "Authorization") String authorization
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    return ResponseEntity.ok(patologiaService.listarPorUsuario(usuarioId));
  }

  @Operation(
      summary = "Listar todas as patologias cadastradas",
      description = "Retorna todas as patologias do sistema (usado, por exemplo, ao criar templates)."
  )
  @GetMapping("/todas")
  public ResponseEntity<List<PatologiaResponseDTO>> listarTodas() {
    return ResponseEntity.ok(patologiaService.listarTodas());
  }

  @Operation(summary = "Buscar patologia por ID")
  @GetMapping("/{id}")
  public ResponseEntity<PatologiaResponseDTO> buscarPorId(@PathVariable Long id) {
    return ResponseEntity.ok(patologiaService.buscarPorId(id));
  }
}
