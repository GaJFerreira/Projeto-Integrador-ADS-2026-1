package br.com.puc.saborfamilia.service.receita.dto.response;

import java.time.LocalDateTime;

public record ReceitaResumoResponse(
  Long id,
  String titulo,
  String fotoCapaUrl,
  Boolean restritaParaUsuario,
  LocalDateTime dataCadastro
) {
}

