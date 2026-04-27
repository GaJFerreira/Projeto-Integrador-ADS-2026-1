package br.com.puc.saborfamilia.service.restricao.impl;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.entity.PerfilRestricaoAlimentarEntity;
import br.com.puc.saborfamilia.database.entity.RestricaoAlimentarEntity;
import br.com.puc.saborfamilia.database.repository.RestricaoAlimentarPerfilRepository;
import br.com.puc.saborfamilia.service.restricao.RestricaoAlimentarPerfilService;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class RestricaoAlimentarPerfilServiceImpl implements RestricaoAlimentarPerfilService {

  private final RestricaoAlimentarPerfilRepository restricaoAlimentarPerfilRepository;

  @Override
  @Transactional
  public void sincronizarRestricoesPerfil(PerfilEntity perfil, List<RestricaoAlimentarEntity> restricoes) {
    restricaoAlimentarPerfilRepository.deleteByPerfilId(perfil.getId());
    inserirRestricoesPerfil(perfil, restricoes);
  }

  private void inserirRestricoesPerfil(PerfilEntity perfil, List<RestricaoAlimentarEntity> restricoes) {
    if (restricoes.isEmpty()) {
      return;
    }

    List<PerfilRestricaoAlimentarEntity> itens = restricoes.stream()
      .map(restricao -> PerfilRestricaoAlimentarEntity.builder()
        .perfil(perfil)
        .restricao(restricao)
        .dataCadastro(LocalDateTime.now())
        .build())
      .toList();

    restricaoAlimentarPerfilRepository.saveAll(itens);
  }

}
