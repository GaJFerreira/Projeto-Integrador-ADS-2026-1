package br.com.puc.saborfamilia.service.receita.dto.response;

import br.com.puc.saborfamilia.database.entity.ReceitaEntity;
import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResumoResponse;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.PersonalizacaoResumoResponse;
import br.com.puc.saborfamilia.service.restricao.dto.RestricaoAlimentarResumoResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

public record ReceitaResponse(
  Long id,
  Boolean curtidoPeloUsuario,
  Boolean restritaParaUsuario,
  PerfilResumoResponse autor,
  DetalhesReceita detalhes,
  EstatisticasReceita estatisticas,
  List<RestricaoAlimentarResumoResponse> restricoesAlimentares,
  List<PersonalizacaoResumoResponse> personalizacao,
  LocalDateTime dataCadastro
) {

  public static ReceitaResponse fromEntity(
    ReceitaEntity receita,
    Integer curtidas,
    Integer comentarios,
    Boolean curtidoPeloUsuario,
    List<RestricaoAlimentarResumoResponse> restricoesAlimentares,
    Boolean restritaParaUsuario,
    List<PersonalizacaoResumoResponse> personalizacao
  ) {

    List<RestricaoAlimentarResumoResponse> restricoes = Objects.requireNonNullElse(restricoesAlimentares, List.of());
    personalizacao = Objects.requireNonNullElse(personalizacao, List.of());

    return new ReceitaResponse(
      receita.getId(),
      curtidoPeloUsuario,
      restritaParaUsuario,
      PerfilResumoResponse.fromEntity(receita.getPerfil()),
      new DetalhesReceita(
        receita.getTitulo(),
        receita.getHistoria(),
        receita.getTipoRefeicao(),
        receita.getIngredientes(),
        receita.getModoPreparo(),
        receita.getTempoPreparoMin(),
        receita.getQtdPorcoes()
      ),
      new EstatisticasReceita(
        curtidas,
        comentarios
      ),
      restricoes,
      personalizacao,
      receita.getDataCadastro()
    );
  }
}
