package br.com.puc.saborfamilia.service.restricao.dto;

import br.com.puc.saborfamilia.database.entity.PerfilRestricaoAlimentarEntity;
import br.com.puc.saborfamilia.database.entity.ReceitaRestricaoAlimentarEntity;
import br.com.puc.saborfamilia.database.entity.RestricaoAlimentarEntity;

public record RestricaoAlimentarResumoResponse(
  Long id,
  String codigo,
  String label,
  String exemplos
) {

  public static RestricaoAlimentarResumoResponse fromEntity(RestricaoAlimentarEntity entity, String label) {
    return new RestricaoAlimentarResumoResponse(
      entity.getId(),
      entity.getCodigo(),
      label,
      entity.getExemplos());
  }

  public static RestricaoAlimentarResumoResponse fromEntity(PerfilRestricaoAlimentarEntity entity) {
    return fromEntity(entity.getRestricao(), entity.getRestricao().getLabelPerfil());
  }

  public static RestricaoAlimentarResumoResponse fromEntity(ReceitaRestricaoAlimentarEntity entity) {
    return fromEntity(entity.getRestricao(), entity.getRestricao().getLabelReceita());
  }

}
