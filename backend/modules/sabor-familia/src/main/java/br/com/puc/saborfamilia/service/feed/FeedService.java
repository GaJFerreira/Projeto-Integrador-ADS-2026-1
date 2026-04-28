package br.com.puc.saborfamilia.service.feed;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.entity.ReceitaEntity;

public interface FeedService {

  void publicarReceitaFeed(PerfilEntity autor, ReceitaEntity receita);

  void popularFeedSeguidores(PerfilEntity seguidor, PerfilEntity seguido);

  void removerReceitaDoFeed(Long receitaId);

  void removerReceitasDoSeguidoNoFeed(Long perfilId, Long seguidoPerfilId);

}
