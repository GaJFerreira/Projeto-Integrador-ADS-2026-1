package br.com.puc.saborfamilia.service.restricao.dto;

import br.com.puc.saborfamilia.database.enums.StatusEnum;
import java.time.LocalDateTime;

public record RestricaoAlimentarResponse(
  Long id,
  String codigo,
  String labelPerfil,
  String labelReceita,
  String exemplos,
  StatusEnum status,
  LocalDateTime dataCadastro
) {

}
