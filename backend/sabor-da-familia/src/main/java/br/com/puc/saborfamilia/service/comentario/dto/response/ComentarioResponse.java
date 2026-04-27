package br.com.puc.saborfamilia.service.comentario.dto.response;

import br.com.puc.saborfamilia.database.entity.ComentarioReceitaEntity;
import java.time.LocalDateTime;

public record ComentarioResponse(
  Long id,
  Long usuarioId,
  Long receitaId,
  String nomeAutor,
  String comentario,
  LocalDateTime dataCadastro
) {

  public static ComentarioResponse fromEntity(ComentarioReceitaEntity comentario) {
    return new ComentarioResponse(
      comentario.getId(),
      comentario.getPerfil().getUsuarioId(),
      comentario.getReceita().getId(),
      comentario.getPerfil().getNome(),
      comentario.getTexto(),
      comentario.getDataCadastro()
    );
  }
}

