package br.com.puc.saborfamilia.service.perfil.dto.response;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;

public record PerfilResumoResponse(
  Long perfilId,
  Long usuarioId,
  String nome,
  String fotoPerfilUrl
) {

  public static PerfilResumoResponse fromEntity(PerfilEntity perfil) {
    return new PerfilResumoResponse(
      perfil.getId(),
      perfil.getUsuarioId(),
      perfil.getNome(),
      perfil.getFotoPerfilUrl()
    );
  }

}
