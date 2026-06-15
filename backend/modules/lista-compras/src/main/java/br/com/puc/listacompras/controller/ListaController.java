package br.com.puc.listacompras.controller;

import br.com.puc.listacompras.dto.ListaCreateRequestDTO;
import br.com.puc.listacompras.dto.ListaResponseDTO;
import br.com.puc.listacompras.service.ListaService;
import br.com.puc.listacompras.utils.JwtClaimsUtils;
import org.springframework.security.access.AccessDeniedException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.AllArgsConstructor;
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

@Tag(name = "Listas", description = "Endpoints para criar e gerenciar listas de compras.")
@RestController
@AllArgsConstructor
@RequestMapping("/api/lista-compras/listas")
public class ListaController {

  private final ListaService listaService;

  @Operation(
      summary = "Criar lista de compras",
      description = "Cria uma nova lista de compras associada ao usuario autenticado."
  )
  @PostMapping
  public ResponseEntity<ListaResponseDTO> criarLista(
      @RequestHeader(value = "Authorization") String authorization,
      @Valid @RequestBody ListaCreateRequestDTO dto
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    if (Boolean.TRUE.equals(dto.getIsTemplate()) && "ROLE_IDOSO".equals(JwtClaimsUtils.getRole(authorization))) {
      throw new AccessDeniedException("Usuarios com perfil Idoso nao podem criar templates.");
    }
    ListaResponseDTO resposta = listaService.criarComItens(usuarioId, dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
  }

  @Operation(
      summary = "Listar listas do usuario",
      description = "Lista as listas (nao-template) do usuario autenticado."
  )
  @GetMapping
  public ResponseEntity<List<ListaResponseDTO>> listarListasDoUsuario(
      @RequestHeader(value = "Authorization") String authorization
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    return ResponseEntity.ok(listaService.listarListasNormais(usuarioId));
  }

  @Operation(
      summary = "Listar templates disponiveis",
      description = "Retorna templates compativeis com as patologias do usuario autenticado."
  )
  @GetMapping("/templates")
  public ResponseEntity<List<ListaResponseDTO>> listarTemplates(
      @RequestHeader(value = "Authorization") String authorization
  ) {
    Long usuarioId = JwtClaimsUtils.getUserId(authorization);
    return ResponseEntity.ok(listaService.listarTemplates(usuarioId));
  }

  @Operation(
      summary = "Buscar lista por ID",
      description = "Retorna os dados de uma lista especifica."
  )
  @GetMapping("/{id}")
  public ResponseEntity<ListaResponseDTO> buscarPorId(@PathVariable Long id) {
    return ResponseEntity.ok(listaService.buscarPorId(id));
  }

  @Operation(
      summary = "Atualizar lista",
      description = "Atualiza titulo, patologia, status de template e itens da lista."
  )
  @PutMapping("/{id}")
  public ResponseEntity<ListaResponseDTO> atualizarLista(
      @PathVariable Long id,
      @Valid @RequestBody ListaCreateRequestDTO dto
  ) {
    return ResponseEntity.ok(listaService.atualizarLista(id, dto));
  }

  @Operation(
      summary = "Finalizar lista",
      description = "Marca a lista como FINALIZADA (arquivada)."
  )
  @PutMapping("/{id}/finalizar")
  public ResponseEntity<ListaResponseDTO> finalizarLista(@PathVariable Long id) {
    return ResponseEntity.ok(listaService.finalizarLista(id));
  }

  @Operation(
      summary = "Reabrir lista",
      description = "Reabre uma lista previamente finalizada."
  )
  @PutMapping("/{id}/reabrir")
  public ResponseEntity<ListaResponseDTO> reabrirLista(@PathVariable Long id) {
    return ResponseEntity.ok(listaService.reabrirLista(id));
  }

  @Operation(
      summary = "Remover lista",
      description = "Remove uma lista de compras. Templates nao podem ser removidos por esta rota."
  )
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletar(@PathVariable Long id) {
    listaService.deletar(id);
    return ResponseEntity.noContent().build();
  }
}
