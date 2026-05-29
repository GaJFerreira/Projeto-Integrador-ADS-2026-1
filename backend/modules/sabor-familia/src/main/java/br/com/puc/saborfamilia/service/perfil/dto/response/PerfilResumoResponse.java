package br.com.puc.saborfamilia.service.perfil.dto.response;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;

public record PerfilResumoResponse(
  Long perfilId,
  Long usuarioId,
  String nome,
  Boolean possuiMidia,
  Boolean seguindoPeloUsuario
) {

  public static PerfilResumoResponse fromEntity(PerfilEntity perfil, boolean possuiMidia, Boolean seguindoPeloUsuario) {
    return new PerfilResumoResponse(
      perfil.getId(),
      perfil.getUsuarioId(),
      perfil.getNome(),
      possuiMidia,
      seguindoPeloUsuario
    );
  }

}
