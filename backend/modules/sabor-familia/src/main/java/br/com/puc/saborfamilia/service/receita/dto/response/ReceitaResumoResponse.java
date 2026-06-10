package br.com.puc.saborfamilia.service.receita.dto.response;

import java.time.LocalDateTime;

public record ReceitaResumoResponse(
  Long id,
  String titulo,
  Boolean possuiMidia,
  Boolean restritaParaUsuario,
  LocalDateTime dataCadastro
) {
}
