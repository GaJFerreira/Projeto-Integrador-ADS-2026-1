package br.com.puc.saborfamilia.enums;

import br.com.puc.saborfamilia.exception.model.ServiceException;
import java.util.Arrays;
import java.util.Locale;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ContextoMidiaEnum {

  AVATAR(TipoEntidadeEnum.PERFIL, "avatar", 128),
  CAPA_PERFIL(TipoEntidadeEnum.PERFIL, "capa-perfil", 256),
  CAPA_GRID(TipoEntidadeEnum.RECEITA, "capa-grid", 448),
  CAPA_FEED(TipoEntidadeEnum.RECEITA, "capa-feed", 896);

  private final TipoEntidadeEnum tipoEntidade;
  private final String codigo;
  private final int larguraMaximaPx;

  public static ContextoMidiaEnum parseContextoMidia(TipoEntidadeEnum tipoEntidade, String contexto) {
    if (contexto == null || contexto.isBlank()) {
      throw new IllegalArgumentException("O parâmetro de contexto da mídia é obrigatório.");
    }

    String normalizado = contexto.trim().toLowerCase(Locale.ROOT);

    return Arrays.stream(values())
      .filter(item -> item.tipoEntidade == tipoEntidade)
      .filter(item -> item.codigo.equals(normalizado))
      .findFirst()
      .orElseThrow(() -> new ServiceException(
        "Contexto de mídia inválido para " + tipoEntidade + ": " + contexto
      ));
  }

}
