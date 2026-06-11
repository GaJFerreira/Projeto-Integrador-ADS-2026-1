package br.com.puc.saborfamilia.service.restricao.impl;

import br.com.puc.saborfamilia.database.entity.RestricaoAlimentarEntity;
import br.com.puc.saborfamilia.enums.StatusEnum;
import br.com.puc.saborfamilia.database.repository.RestricaoAlimentarRepository;
import br.com.puc.saborfamilia.exception.model.ResourceNotFoundException;
import br.com.puc.saborfamilia.exception.model.ServiceException;
import br.com.puc.saborfamilia.service.restricao.RestricaoAlimentarService;
import br.com.puc.saborfamilia.service.restricao.dto.RestricaoAlimentarResponse;
import br.com.puc.saborfamilia.service.restricao.dto.request.EditarRestricaoAlimentarRequest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class RestricaoAlimentarServiceImpl implements RestricaoAlimentarService {

  private static final String RESTRICAO_ALIMENTAR_NAO_ENCONTRADA = "Restrição alimentar não encontrada para o código informado.";
  private static final String RESTRICOES_ALIMENTARES_NAO_ENCONTRADAS = "Restrições alimentares não encontradas no catálogo para os códigos: [%s]";

  private final RestricaoAlimentarRepository restricaoAlimentarRepository;

  @Override
  @Transactional(readOnly = true)
  public RestricaoAlimentarResponse buscarRestricaoAlimentar(String codigo) {
    RestricaoAlimentarEntity restricaoAlimentar = restricaoAlimentarRepository.findByCodigoIgnoreCase(codigo)
      .orElseThrow(() -> new ResourceNotFoundException(RESTRICAO_ALIMENTAR_NAO_ENCONTRADA));

    if (!StatusEnum.ATIVO.equals(restricaoAlimentar.getStatus())) {
      throw new ResourceNotFoundException(RESTRICAO_ALIMENTAR_NAO_ENCONTRADA);
    }

    return toResponse(restricaoAlimentar);
  }

  @Override
  @Transactional(readOnly = true)
  public List<RestricaoAlimentarResponse> buscarRestricoesAlimentares() {
    return restricaoAlimentarRepository.findByStatus(StatusEnum.ATIVO)
      .stream()
      .sorted(Comparator.comparing(RestricaoAlimentarEntity::getCodigo, String.CASE_INSENSITIVE_ORDER))
      .map(this::toResponse)
      .toList();
  }

  @Override
  @Transactional
  public RestricaoAlimentarResponse editarRestricaoAlimentar(String codigo, EditarRestricaoAlimentarRequest request) {
    RestricaoAlimentarEntity restricao = buscarRestricaoPorCodigo(codigo);

    restricao.setLabelPerfil(request.labelPerfil());
    restricao.setLabelReceita(request.labelReceita());
    restricao.setExemplos(request.exemplos());
    restricao.setUltimaAtualizacao(LocalDateTime.now());

    RestricaoAlimentarEntity atualizada = restricaoAlimentarRepository.save(restricao);

    return toResponse(atualizada);
  }

  @Override
  @Transactional
  public RestricaoAlimentarResponse ativarRestricaoAlimentar(String codigo) {
    return alterarStatus(codigo, StatusEnum.ATIVO);
  }

  @Override
  @Transactional
  public RestricaoAlimentarResponse inativarRestricaoAlimentar(String codigo) {
    return alterarStatus(codigo, StatusEnum.INATIVO);
  }

  private RestricaoAlimentarResponse alterarStatus(String codigo, StatusEnum status) {
    RestricaoAlimentarEntity restricao = buscarRestricaoPorCodigo(codigo);

    if (!restricao.getStatus().equals(status)) {
      restricao.setStatus(status);
      restricao.setUltimaAtualizacao(LocalDateTime.now());
      restricaoAlimentarRepository.save(restricao);
    }

    return toResponse(restricao);
  }

  private RestricaoAlimentarEntity buscarRestricaoPorCodigo(String codigo) {
    return restricaoAlimentarRepository.findByCodigoIgnoreCase(codigo)
      .orElseThrow(() -> new ResourceNotFoundException(RESTRICAO_ALIMENTAR_NAO_ENCONTRADA));
  }

  @Override
  public List<RestricaoAlimentarEntity> validarRestricoesAlimentares(List<String> restricaoCodigos) {
    if (restricaoCodigos == null || restricaoCodigos.isEmpty()) {
      return List.of();
    }

    List<String> codigos = List.copyOf(new LinkedHashSet<>(restricaoCodigos.stream()
      .filter(c -> c != null && !c.isBlank())
      .map(c -> c.trim().toUpperCase())
      .toList()));

    List<RestricaoAlimentarEntity> entidades = restricaoAlimentarRepository
      .findByCodigoInAndStatus(codigos, StatusEnum.ATIVO);

    Map<String, RestricaoAlimentarEntity> porCodigo = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
    for (RestricaoAlimentarEntity e : entidades) {
      porCodigo.putIfAbsent(e.getCodigo(), e);
    }

    validarCodigosEncontrados(codigos, porCodigo.keySet());

    List<RestricaoAlimentarEntity> ordenadas = new ArrayList<>(codigos.size());
    for (String codigo : codigos) {
      ordenadas.add(porCodigo.get(codigo));
    }

    return ordenadas;
  }

  private void validarCodigosEncontrados(List<String> informados, Set<String> encontrados) {
    List<String> naoEncontrados = informados.stream()
      .filter(c -> encontrados.stream().noneMatch(e -> e.equalsIgnoreCase(c)))
      .toList();

    if (!naoEncontrados.isEmpty()) {
      throw new ServiceException(
        String.format(RESTRICOES_ALIMENTARES_NAO_ENCONTRADAS, String.join(", ", naoEncontrados)));
    }
  }

  private RestricaoAlimentarResponse toResponse(RestricaoAlimentarEntity entity) {
    return new RestricaoAlimentarResponse(
      entity.getId(),
      entity.getCodigo(),
      entity.getLabelPerfil(),
      entity.getLabelReceita(),
      entity.getExemplos(),
      entity.getStatus(),
      entity.getDataCadastro());
  }

}
