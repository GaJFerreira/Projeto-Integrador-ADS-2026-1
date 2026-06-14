package br.com.puc.saborfamilia.utils;

import br.com.puc.saborfamilia.enums.FormatoMidiaEnum;
import org.springframework.stereotype.Component;

@Component
public class MidiaPathResolver {

  public static final String DIRETORIO_RAIZ = "perfil";
  public static final String PREFIXO_FOTO_PERFIL = "avatar";
  public static final String SUBDIRETORIO_RECEITAS = "receitas";

  public String caminhoPerfil(Long perfilId) {
    return DIRETORIO_RAIZ + "/" + perfilId;
  }

  public String caminhoRelativoAvatar(Long perfilId, FormatoMidiaEnum formato) {
    return caminhoPerfil(perfilId) + "/" + PREFIXO_FOTO_PERFIL + formato.getExtensao();
  }

  public String caminhoRelativoCapaReceita(Long perfilId, Long receitaId, FormatoMidiaEnum formato) {
    return caminhoPerfil(perfilId)
      + "/"
      + SUBDIRETORIO_RECEITAS
      + "/"
      + receitaId
      + formato.getExtensao();
  }

}
