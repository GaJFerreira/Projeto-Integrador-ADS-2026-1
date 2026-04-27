package br.com.puc.saborfamilia.service.receita.dto.response;

import br.com.puc.saborfamilia.database.entity.CurtidaReceitaEntity;
import br.com.puc.saborfamilia.database.entity.PerfilEntity;

public record PerfilCurtidaResponse(
  Long perfilId,
  String nomePerfil,
  String fotoPerfilUrl
) {

  public static PerfilCurtidaResponse fromEntity(CurtidaReceitaEntity curtida) {
    PerfilEntity perfil = curtida.getPerfil();
    return new PerfilCurtidaResponse(perfil.getId(), perfil.getNome(), perfil.getFotoPerfilUrl());
  }

}
