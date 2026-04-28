package br.com.puc.saborfamilia.service.feed.impl;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.entity.ReceitaEntity;
import br.com.puc.saborfamilia.database.repository.FeedPerfilReceitaRepository;
import br.com.puc.saborfamilia.database.repository.ReceitaRepository;
import br.com.puc.saborfamilia.database.repository.SeguindoRepository;
import br.com.puc.saborfamilia.service.feed.FeedService;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class FeedServiceImpl implements FeedService {

  private final FeedPerfilReceitaRepository feedPerfilReceitaRepository;
  private final SeguindoRepository seguindoRepository;
  private final ReceitaRepository receitaRepository;

  @Override
  public void publicarReceitaFeed(PerfilEntity autor, ReceitaEntity receita) {
    LocalDateTime dataCadastroReceita = receita.getDataCadastro();
    inserirNoFeed(autor.getId(), receita.getId(), dataCadastroReceita);

    List<Long> seguidoresIds = seguindoRepository.findSeguidorIdBySeguidoId(autor.getId());

    for (Long seguidorId : seguidoresIds) {
      inserirNoFeed(seguidorId, receita.getId(), dataCadastroReceita);
    }
  }

  @Override
  public void popularFeedSeguidores(PerfilEntity seguidor, PerfilEntity seguido) {
    List<ReceitaEntity> receitasPublicadas = receitaRepository.findByPerfilIdOrderByDataCadastroDesc(seguido.getId());

    for (ReceitaEntity receita : receitasPublicadas) {
      inserirNoFeed(seguidor.getId(), receita.getId(), receita.getDataCadastro());
    }
  }

  @Override
  public void removerReceitaDoFeed(Long receitaId) {
    feedPerfilReceitaRepository.deleteByReceitaId(receitaId);
  }

  @Override
  public void removerReceitasDoSeguidoNoFeed(Long perfilId, Long seguidoPerfilId) {
    feedPerfilReceitaRepository.deleteByPerfilIdAndReceitaPerfilId(perfilId, seguidoPerfilId);
  }

  private void inserirNoFeed(Long perfilId, Long receitaId, LocalDateTime dataCadastro) {
    feedPerfilReceitaRepository.insertIgnoringConflicts(perfilId, receitaId, dataCadastro);
  }
}
