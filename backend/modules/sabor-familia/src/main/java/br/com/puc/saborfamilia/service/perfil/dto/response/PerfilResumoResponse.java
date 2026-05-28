package br.com.puc.saborfamilia.service.perfil.dto.response;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;

public record PerfilResumoResponse(
  Long perfilId,
  Long usuarioId,
  String nome,
  String fotoPerfilUrl,
  Boolean seguindoPeloUsuario
) {

  public static PerfilResumoResponse fromEntity(PerfilEntity perfil) {
    return fromEntity(perfil, null);
  }

  public static PerfilResumoResponse fromEntity(PerfilEntity perfil, Boolean seguindoPeloUsuario) {
    return new PerfilResumoResponse(
      perfil.getId(),
      perfil.getUsuarioId(),
      perfil.getNome(),
      perfil.getFotoPerfilUrl(),
      seguindoPeloUsuario
    );
  }

}
