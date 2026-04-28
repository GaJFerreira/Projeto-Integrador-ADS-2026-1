package br.com.puc.saborfamilia.service.restricao;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.entity.RestricaoAlimentarEntity;
import java.util.List;

public interface RestricaoAlimentarPerfilService {

  void sincronizarRestricoesPerfil(PerfilEntity perfil, List<RestricaoAlimentarEntity> restricoes);

}
