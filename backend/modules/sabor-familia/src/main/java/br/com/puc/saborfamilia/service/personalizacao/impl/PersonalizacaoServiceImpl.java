package br.com.puc.saborfamilia.service.personalizacao.impl;

import br.com.puc.saborfamilia.database.entity.PersonalizacaoEntity;
import br.com.puc.saborfamilia.enums.CategoriaPersonalizacaoEnum;
import br.com.puc.saborfamilia.enums.StatusEnum;
import br.com.puc.saborfamilia.database.repository.PersonalizacaoRepository;
import br.com.puc.saborfamilia.exception.model.ResourceNotFoundException;
import br.com.puc.saborfamilia.exception.model.ServiceException;
import br.com.puc.saborfamilia.service.personalizacao.PersonalizacaoService;
import br.com.puc.saborfamilia.service.personalizacao.dto.request.EditarPersonalizacaoRequest;

import br.com.puc.saborfamilia.service.personalizacao.dto.response.CatalogoPersonalizacaoResponse;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.PersonalizacaoResponse;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.PersonalizacaoResumoResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class PersonalizacaoServiceImpl implements PersonalizacaoService {

  private static final String PERSONALIZACAO_NAO_ENCONTRADA = "Personalização não encontrada para o código informado.";
  private static final String PERSONALIZACOES_NAO_ENCONTRADAS = "Personalizações não encontradas no catálogo para os códigos: [%s]";

  private final PersonalizacaoRepository personalizacaoRepository;

  @Override
  @Transactional(readOnly = true)
  public List<CatalogoPersonalizacaoResponse> listarCatalogo() {
    List<PersonalizacaoEntity> opcoesAtivas = personalizacaoRepository.findByStatus(StatusEnum.ATIVO);

    Map<CategoriaPersonalizacaoEnum, List<PersonalizacaoResponse>> opcoesPorCategoria = opcoesAtivas.stream()
      .collect(Collectors.groupingBy(
        PersonalizacaoEntity::getCategoria,
        Collectors.mapping(this::toResponse, Collectors.toList())
      ));

    return opcoesPorCategoria.entrySet().stream()
      .sorted(Map.Entry.comparingByKey())
      .map(entry -> new CatalogoPersonalizacaoResponse(entry.getKey().name(), entry.getValue()))
      .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<PersonalizacaoResumoResponse> listarCatalogoContextoPerfil() {
    return personalizacaoRepository.findByStatus(StatusEnum.ATIVO).stream()
      .sorted(Comparator.comparing(PersonalizacaoEntity::getCategoria).thenComparing(PersonalizacaoEntity::getCodigo))
      .map(personalizacao -> new PersonalizacaoResumoResponse(
        personalizacao.getId(),
        personalizacao.getCategoria(),
        personalizacao.getCodigo(),
        personalizacao.getLabelPerfil()
      ))
      .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<PersonalizacaoResumoResponse> listarCatalogoContextoReceita() {
    return personalizacaoRepository
      .findByStatus(StatusEnum.ATIVO).stream()
      .sorted(Comparator.comparing(PersonalizacaoEntity::getCategoria).thenComparing(PersonalizacaoEntity::getCodigo))
      .map(personalizacao -> new PersonalizacaoResumoResponse(
        personalizacao.getId(),
        personalizacao.getCategoria(),
        personalizacao.getCodigo(),
        personalizacao.getLabelReceita()
      ))
      .toList();
  }

  @Override
  public PersonalizacaoResponse editarPersonalizacao(String codigo, EditarPersonalizacaoRequest request) {
    PersonalizacaoEntity personalizacao = buscarPersonalizacao(codigo);

    personalizacao.setLabelPerfil(request.labelPerfil());
    personalizacao.setLabelReceita(request.labelReceita());
    personalizacao.setUltimaAtualizacao(LocalDateTime.now());

    PersonalizacaoEntity personalizacaoAtualizada = personalizacaoRepository.save(personalizacao);

    return toResponse(personalizacaoAtualizada);
  }

  @Override
  @Transactional
  public PersonalizacaoResponse ativarPersonalizacao(String codigo) {
    return alterarStatus(codigo, StatusEnum.ATIVO);
  }

  @Override
  @Transactional
  public PersonalizacaoResponse inativarPersonalizacao(String codigo) {
    return alterarStatus(codigo, StatusEnum.INATIVO);
  }

  @Override
  @Transactional(readOnly = true)
  public List<PersonalizacaoEntity> validarPersonalizacoes(List<String> codigosPersonalizacao) {
    if (codigosPersonalizacao == null || codigosPersonalizacao.isEmpty()) {
      return List.of();
    }

    List<String> codigos = List.copyOf(new LinkedHashSet<>(codigosPersonalizacao.stream()
      .filter(c -> c != null && !c.isBlank())
      .map(c -> c.trim().toUpperCase())
      .toList()));

    if (codigos.isEmpty()) {
      return List.of();
    }

    List<PersonalizacaoEntity> encontradas = personalizacaoRepository.findByCodigoIn(codigos);

    Map<String, PersonalizacaoEntity> porCodigo = new HashMap<>();
    for (PersonalizacaoEntity p : encontradas) {
      if (StatusEnum.ATIVO.equals(p.getStatus())) {
        porCodigo.putIfAbsent(p.getCodigo(), p);
      }
    }

    List<String> invalidos = codigos.stream()
      .filter(c -> !porCodigo.containsKey(c))
      .toList();

    if (!invalidos.isEmpty()) {
      throw new ServiceException(
        String.format(PERSONALIZACOES_NAO_ENCONTRADAS, String.join(", ", invalidos)));
    }

    List<PersonalizacaoEntity> ordenadas = new ArrayList<>(codigos.size());
    for (String codigo : codigos) {
      ordenadas.add(porCodigo.get(codigo));
    }

    return ordenadas;
  }

  private PersonalizacaoResponse alterarStatus(String codigo, StatusEnum status) {
    PersonalizacaoEntity personalizacao = buscarPersonalizacao(codigo);

    if (!personalizacao.getStatus().equals(status)) {
      personalizacao.setStatus(status);
      personalizacao.setUltimaAtualizacao(LocalDateTime.now());
      personalizacaoRepository.save(personalizacao);
    }

    return toResponse(personalizacao);
  }

  private PersonalizacaoEntity buscarPersonalizacao(String codigo) {
    return personalizacaoRepository.findByCodigoIgnoreCase(codigo)
      .orElseThrow(() -> new ResourceNotFoundException(PERSONALIZACAO_NAO_ENCONTRADA));
  }

  private PersonalizacaoResponse toResponse(PersonalizacaoEntity entity) {
    return new PersonalizacaoResponse(
      entity.getId(),
      entity.getCategoria(),
      entity.getCodigo(),
      entity.getLabelPerfil(),
      entity.getLabelReceita(),
      entity.getStatus()
    );
  }

}
