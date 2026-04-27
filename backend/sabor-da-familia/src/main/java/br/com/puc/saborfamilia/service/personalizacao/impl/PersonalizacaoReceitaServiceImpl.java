package br.com.puc.saborfamilia.service.personalizacao.impl;

import br.com.puc.saborfamilia.database.entity.PersonalizacaoEntity;
import br.com.puc.saborfamilia.database.entity.PersonalizacaoReceitaEntity;
import br.com.puc.saborfamilia.database.entity.ReceitaEntity;
import br.com.puc.saborfamilia.database.repository.PersonalizacaoReceitaRepository;
import br.com.puc.saborfamilia.service.personalizacao.PersonalizacaoReceitaService;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.PersonalizacaoResumoResponse;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class PersonalizacaoReceitaServiceImpl implements PersonalizacaoReceitaService {

  private final PersonalizacaoReceitaRepository personalizacaoReceitaRepository;

  @Override
  @Transactional
  public void sincronizarPersonalizacoesReceita(ReceitaEntity receita, List<PersonalizacaoEntity> personalizacoes) {
    personalizacaoReceitaRepository.deleteByReceitaId(receita.getId());

    if (personalizacoes == null || personalizacoes.isEmpty()) {
      return;
    }

    List<PersonalizacaoReceitaEntity> vinculos = personalizacoes.stream()
      .map(opcao -> PersonalizacaoReceitaEntity.builder()
        .receita(receita)
        .personalizacao(opcao)
        .dataCadastro(LocalDateTime.now())
        .build())
      .toList();

    personalizacaoReceitaRepository.saveAll(vinculos);
  }

  @Override
  @Transactional
  public void removerVinculosReceita(Long receitaId) {
    personalizacaoReceitaRepository.deleteByReceitaId(receitaId);
  }

  @Override
  @Transactional(readOnly = true)
  public List<PersonalizacaoResumoResponse> buscarPersonalizacoesReceita(Long receitaId) {
    List<PersonalizacaoReceitaEntity> personalizacoes = personalizacaoReceitaRepository.findByReceitaId(receitaId);

    return personalizacoes.stream()
      .map(opcao -> {
        PersonalizacaoEntity personalizacao = opcao.getPersonalizacao();

        return new PersonalizacaoResumoResponse(
          personalizacao.getId(),
          personalizacao.getCategoria(),
          personalizacao.getCodigo(),
          personalizacao.getLabelReceita()
        );
      })
      .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public Map<Long, List<PersonalizacaoResumoResponse>> buscarPersonalizacoesReceitaEmLote(List<Long> receitaIds) {
    if (receitaIds == null || receitaIds.isEmpty()) {
      return Map.of();
    }

    List<Long> idsDistintos = receitaIds.stream().distinct().toList();

    List<PersonalizacaoReceitaEntity> vinculos = personalizacaoReceitaRepository.findByReceitaIdIn(idsDistintos);

    Map<Long, List<PersonalizacaoReceitaEntity>> personalizacaoPorReceita = vinculos.stream()
      .collect(Collectors.groupingBy(link -> link.getReceita().getId()));

    Map<Long, List<PersonalizacaoResumoResponse>> resultado = new HashMap<>();

    for (Map.Entry<Long, List<PersonalizacaoReceitaEntity>> entry : personalizacaoPorReceita.entrySet()) {
      List<PersonalizacaoResumoResponse> opcoes = entry.getValue().stream()
        .map(opcao -> {
          PersonalizacaoEntity personalizacao = opcao.getPersonalizacao();

          return new PersonalizacaoResumoResponse(
            personalizacao.getId(),
            personalizacao.getCategoria(),
            personalizacao.getCodigo(),
            personalizacao.getLabelReceita()
          );
        })
        .toList();

      resultado.put(entry.getKey(), opcoes);
    }

    return resultado;
  }

}
