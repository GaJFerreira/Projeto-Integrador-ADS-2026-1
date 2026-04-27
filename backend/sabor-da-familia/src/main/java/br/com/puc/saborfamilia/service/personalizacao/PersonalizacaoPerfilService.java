package br.com.puc.saborfamilia.service.personalizacao;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.entity.PersonalizacaoEntity;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.PersonalizacaoResumoResponse;
import java.util.List;

public interface PersonalizacaoPerfilService {

  void sincronizarPersonalizacoesPerfil(PerfilEntity perfil, List<PersonalizacaoEntity> personalizacoes);

  List<PersonalizacaoResumoResponse> buscarPersonalizacoesPerfil(Long perfilId);

  void removerVinculosPerfil(Long perfilId);

}
