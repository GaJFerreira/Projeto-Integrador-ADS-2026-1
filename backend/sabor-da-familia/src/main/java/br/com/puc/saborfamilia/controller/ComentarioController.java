package br.com.puc.saborfamilia.controller;

import br.com.puc.saborfamilia.service.comentario.ComentarioService;
import br.com.puc.saborfamilia.service.comentario.dto.request.ComentarioRequest;
import br.com.puc.saborfamilia.service.comentario.dto.response.ComentarioResponse;
import br.com.puc.saborfamilia.service.comentario.dto.response.RemoverComentarioResponse;
import br.com.puc.saborfamilia.service.receita.dto.response.PerfilComentarioResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping(value = "/receita")
@Tag(name = "Comentário", description = "Serviços para gerenciar comentários das receitas.")
public class ComentarioController {

  private final ComentarioService comentarioService;

  @GetMapping(value = "/{receitaId}/comentarios")
  @Operation(
    summary = "Listar comentários de uma receita",
    description = "Retorna todos os comentários da receita informada."
  )
  public ResponseEntity<List<PerfilComentarioResponse>> buscarComentariosReceita(
    @PathVariable Long receitaId
  ) {
    return ResponseEntity.ok(comentarioService.buscarComentariosReceita(receitaId));
  }

  @PostMapping(value = "/{receitaId}/comentarios")
  @Operation(
    summary = "Adicionar comentário em uma receita",
    description = "Cria um novo comentário na receita para o perfil do usuário informado."
  )
  public ResponseEntity<ComentarioResponse> adicionarComentario(
    @RequestHeader(value = "X-User-Id") Long usuarioId,
    @PathVariable Long receitaId,
    @Valid @RequestBody ComentarioRequest request
  ) {
    ComentarioResponse response = comentarioService.adicionarComentario(usuarioId, receitaId, request);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping(value = "/{receitaId}/comentarios/{comentarioId}")
  @Operation(
    summary = "Remover comentário",
    description = "Remove um comentário da receita. Apenas o autor do comentário pode removê-lo."
  )
  public ResponseEntity<RemoverComentarioResponse> removerComentario(
    @RequestHeader(value = "X-User-Id") Long usuarioId,
    @PathVariable Long receitaId,
    @PathVariable Long comentarioId
  ) {
    RemoverComentarioResponse response = comentarioService.removerComentario(usuarioId, receitaId, comentarioId);
    return ResponseEntity.ok(response);
  }

}
