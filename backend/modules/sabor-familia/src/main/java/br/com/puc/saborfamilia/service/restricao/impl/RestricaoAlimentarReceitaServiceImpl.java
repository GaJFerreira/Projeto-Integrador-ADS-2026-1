package br.com.puc.saborfamilia.service.restricao.impl;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.entity.ReceitaEntity;
import br.com.puc.saborfamilia.database.entity.ReceitaRestricaoAlimentarEntity;
import br.com.puc.saborfamilia.database.entity.RestricaoAlimentarEntity;
import br.com.puc.saborfamilia.database.enums.StatusEnum;
import br.com.puc.saborfamilia.database.repository.PerfilRepository;
import br.com.puc.saborfamilia.database.repository.RestricaoAlimentarReceitaRepository;
import br.com.puc.saborfamilia.exception.model.ResourceNotFoundException;
import br.com.puc.saborfamilia.service.restricao.RestricaoAlimentarReceitaService;
import br.com.puc.saborfamilia.service.restricao.dto.RestricaoAlimentarResumoResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class RestricaoAlimentarReceitaServiceImpl implements RestricaoAlimentarReceitaService {

  private static final String PERFIL_NAO_ENCONTRADO = "Perfil não encontrado para o usuário informado.";

  private final RestricaoAlimentarReceitaRepository restricaoAlimentarReceitaRepository;
  private final PerfilRepository perfilRepository;

  @Override
  @Transactional(readOnly = true)
  public Map<Long, List<RestricaoAlimentarResumoResponse>> buscarRestricoesAlimentaresEmLote(List<Long> receitaIds) {
    if (receitaIds == null || receitaIds.isEmpty()) {
      return Map.of();
    }

    List<ReceitaRestricaoAlimentarEntity> itens = restricaoAlimentarReceitaRepository
      .findByReceitaIdInAndStatus(receitaIds, StatusEnum.ATIVO);

    return itens.stream()
      .collect(Collectors.groupingBy(
        item -> item.getReceita().getId(),
        Collectors.mapping(
          RestricaoAlimentarResumoResponse::fromEntity,
          Collectors.toList()
        )
      ));
  }

  @Override
  @Transactional(readOnly = true)
  public Map<Long, Boolean> buscarRestricoesUsuario(List<ReceitaEntity> receitas, Long usuarioId) {
    if (usuarioId == null || receitas == null || receitas.isEmpty()) {
      return Map.of();
    }

    PerfilEntity perfilViewer = perfilRepository.findByUsuarioIdWithRestricoes(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    Set<Long> restricaoPerfilIds = perfilViewer.getRestricoesAlimentares().stream()
      .map(restricaoPerfil -> restricaoPerfil.getRestricao().getId())
      .collect(Collectors.toSet());

    if (restricaoPerfilIds.isEmpty()) {
      return receitas.stream()
        .collect(Collectors.toMap(ReceitaEntity::getId, receita -> false));
    }

    Map<Long, List<RestricaoAlimentarResumoResponse>> restricoesPorReceita = buscarRestricoesAlimentaresEmLote(
      receitas.stream().map(ReceitaEntity::getId).toList()
    );

    return receitas.stream()
      .collect(Collectors.toMap(
        ReceitaEntity::getId,
        receita -> {
          List<RestricaoAlimentarResumoResponse> restricoesReceita = restricoesPorReceita.getOrDefault(receita.getId(), List.of());
          return restricoesReceita.stream()
            .anyMatch(restricao -> restricaoPerfilIds.contains(restricao.id()));
        }
      ));
  }

  @Override
  @Transactional
  public List<RestricaoAlimentarResumoResponse> sincronizarRestricoesReceita(ReceitaEntity receita,
    List<RestricaoAlimentarEntity> restricoesAlimentares) {

    restricaoAlimentarReceitaRepository.deleteByReceitaId(receita.getId());

    if (restricoesAlimentares == null || restricoesAlimentares.isEmpty()) {
      return List.of();
    }

    List<ReceitaRestricaoAlimentarEntity> itens = restricoesAlimentares.stream()
      .map(restricao -> ReceitaRestricaoAlimentarEntity.builder()
        .receita(receita)
        .restricao(restricao)
        .dataCadastro(LocalDateTime.now())
        .build())
      .toList();

    restricaoAlimentarReceitaRepository.saveAll(itens);

    return restricoesAlimentares.stream()
      .map(r -> RestricaoAlimentarResumoResponse.fromEntity(r, r.getLabelReceita()))
      .toList();
  }

  @Override
  @Transactional
  public void removerRestricoesReceita(Long receitaId) {
    restricaoAlimentarReceitaRepository.deleteByReceitaId(receitaId);
  }

}
