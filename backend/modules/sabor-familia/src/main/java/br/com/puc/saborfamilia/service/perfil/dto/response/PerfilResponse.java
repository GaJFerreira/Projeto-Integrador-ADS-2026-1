package br.com.puc.saborfamilia.service.perfil.dto.response;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.PersonalizacaoResumoResponse;
import br.com.puc.saborfamilia.service.restricao.dto.RestricaoAlimentarResumoResponse;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record PerfilResponse(
  Long id,
  Long usuarioId,
  Boolean proprioPerfil,
  Boolean seguindoPerfil,
  DetalhesPerfil detalhes,
  EstatisticasPerfil estatisticas,
  List<RestricaoAlimentarResumoResponse> restricoesAlimentares,
  List<PersonalizacaoResumoResponse> personalizacao,
  LocalDateTime dataCadastro
) {

  public static PerfilResponse fromEntity(
    PerfilEntity perfil,
    Boolean proprioPerfil,
    Boolean seguindoPerfil,
    long seguidores,
    long seguindo,
    List<RestricaoAlimentarResumoResponse> restricoes,
    List<PersonalizacaoResumoResponse> personalizacao
  ) {

    return new PerfilResponse(
      perfil.getId(),
      perfil.getUsuarioId(),
      proprioPerfil,
      seguindoPerfil,
      new DetalhesPerfil(
        perfil.getNome(),
        perfil.getEmail(),
        perfil.getBio(),
        perfil.getFotoPerfilUrl()
      ),
      new EstatisticasPerfil(
        seguidores,
        seguindo
      ),
      restricoes,
      personalizacao,
      perfil.getDataCadastro()
    );
  }
}
