package br.com.puc.saborfamilia.service.personalizacao.impl;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.entity.PersonalizacaoEntity;
import br.com.puc.saborfamilia.database.entity.PersonalizacaoPerfilEntity;
import br.com.puc.saborfamilia.database.repository.PersonalizacaoPerfilRepository;
import br.com.puc.saborfamilia.service.personalizacao.PersonalizacaoPerfilService;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.PersonalizacaoResumoResponse;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class PersonalizacaoPerfilServiceImpl implements PersonalizacaoPerfilService {

  private final PersonalizacaoPerfilRepository personalizacaoPerfilRepository;

  @Override
  @Transactional(readOnly = true)
  public List<PersonalizacaoResumoResponse> buscarPersonalizacoesPerfil(Long perfilId) {
    List<PersonalizacaoPerfilEntity> personalizacoesPerfil = personalizacaoPerfilRepository
      .findByPerfilId(perfilId);

    return personalizacoesPerfil.stream()
      .map(personalizacaoPerfil -> {
        PersonalizacaoEntity personalizacao = personalizacaoPerfil.getPersonalizacao();

        return new PersonalizacaoResumoResponse(
          personalizacao.getId(),
          personalizacao.getCategoria(),
          personalizacao.getCodigo(),
          personalizacao.getLabelPerfil()
        );
      })
      .toList();
  }

  @Override
  @Transactional
  public void sincronizarPersonalizacoesPerfil(PerfilEntity perfil, List<PersonalizacaoEntity> personalizacoes) {
    personalizacaoPerfilRepository.deleteByPerfilId(perfil.getId());

    if (personalizacoes == null || personalizacoes.isEmpty()) {
      return;
    }

    List<PersonalizacaoPerfilEntity> personalizacoesPerfil = personalizacoes.stream()
      .map(opcao -> PersonalizacaoPerfilEntity.builder()
        .perfil(perfil)
        .personalizacao(opcao)
        .dataCadastro(LocalDateTime.now())
        .build())
      .toList();

    personalizacaoPerfilRepository.saveAll(personalizacoesPerfil);
  }

  @Override
  @Transactional
  public void removerVinculosPerfil(Long perfilId) {
    personalizacaoPerfilRepository.deleteByPerfilId(perfilId);
  }

}
