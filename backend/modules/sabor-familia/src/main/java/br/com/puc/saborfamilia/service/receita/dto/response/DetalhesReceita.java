package br.com.puc.saborfamilia.service.receita.dto.response;

import br.com.puc.saborfamilia.enums.TipoRefeicaoEnum;

public record DetalhesReceita(
  String titulo,
  String historia,
  TipoRefeicaoEnum tipoRefeicao,
  String ingredientes,
  String modoPreparo,
  Integer tempoPreparoMin,
  Integer qtdPorcoes
) {

}