package br.com.puc.saborfamilia.service.receita.dto.response;

import br.com.puc.saborfamilia.database.entity.ComentarioReceitaEntity;
import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import java.time.LocalDateTime;

public record PerfilComentarioResponse(
  Long id,
  Long perfilId,
  String nomePerfil,
  String fotoPerfilUrl,
  String comentario,
  LocalDateTime dataComentario
) {

  public static PerfilComentarioResponse fromEntity(ComentarioReceitaEntity comentario) {
    PerfilEntity perfil = comentario.getPerfil();

    return new PerfilComentarioResponse(
      comentario.getId(),
      perfil.getId(),
      perfil.getNome(),
      perfil.getFotoPerfilUrl(),
      comentario.getTexto(),
      comentario.getDataCadastro()
    );
  }

}
