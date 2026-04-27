package br.com.puc.saborfamilia.service.receita.impl;

import br.com.puc.saborfamilia.database.entity.FavoritoReceitaEntity;
import br.com.puc.saborfamilia.database.entity.FeedPerfilReceitaEntity;
import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.entity.PersonalizacaoEntity;
import br.com.puc.saborfamilia.database.entity.ReceitaEntity;
import br.com.puc.saborfamilia.database.entity.RestricaoAlimentarEntity;
import br.com.puc.saborfamilia.database.enums.TipoRefeicaoEnum;
import br.com.puc.saborfamilia.database.repository.CurtidaReceitaRepository;
import br.com.puc.saborfamilia.database.repository.FavoritoReceitaRepository;
import br.com.puc.saborfamilia.database.repository.FeedPerfilReceitaRepository;
import br.com.puc.saborfamilia.database.repository.PerfilRepository;
import br.com.puc.saborfamilia.database.repository.PersonalizacaoPerfilRepository;
import br.com.puc.saborfamilia.database.repository.ReceitaRepository;
import br.com.puc.saborfamilia.exception.model.ResourceNotFoundException;
import br.com.puc.saborfamilia.exception.model.ServiceException;
import br.com.puc.saborfamilia.service.feed.FeedService;
import br.com.puc.saborfamilia.service.personalizacao.PersonalizacaoReceitaService;
import br.com.puc.saborfamilia.service.personalizacao.PersonalizacaoService;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.PersonalizacaoResumoResponse;
import br.com.puc.saborfamilia.service.receita.ReceitaService;
import br.com.puc.saborfamilia.service.receita.dto.request.ReceitaRequest;
import br.com.puc.saborfamilia.service.receita.dto.response.ReceitaResponse;
import br.com.puc.saborfamilia.service.receita.dto.response.ReceitaResumoResponse;
import br.com.puc.saborfamilia.service.receita.dto.response.RemoverReceitaResponse;
import br.com.puc.saborfamilia.service.restricao.RestricaoAlimentarReceitaService;
import br.com.puc.saborfamilia.service.restricao.RestricaoAlimentarService;
import br.com.puc.saborfamilia.service.restricao.dto.RestricaoAlimentarResumoResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@AllArgsConstructor
public class ReceitaServiceImpl implements ReceitaService {

  private static final String PERFIL_NAO_ENCONTRADO = "Perfil não encontrado para o usuário informado.";
  private static final String RECEITA_NAO_ENCONTRADA = "Receita não encontrada para o ID informado.";
  private static final String SEM_PERMISSAO_EDITAR_RECEITA = "Não foi possível editar a receita, o usuário informado não é o criador.";
  private static final String SEM_PERMISSAO_REMOVER_RECEITA = "Não foi possível remover a receita, o usuário informado não é o criador.";

  private final ReceitaRepository receitaRepository;
  private final PerfilRepository perfilRepository;
  private final FavoritoReceitaRepository favoritoReceitaRepository;
  private final FeedPerfilReceitaRepository feedPerfilReceitaRepository;
  private final CurtidaReceitaRepository curtidaReceitaRepository;
  private final FeedService feedService;
  private final RestricaoAlimentarService restricaoAlimentarService;
  private final RestricaoAlimentarReceitaService restricaoAlimentarReceitaService;
  private final PersonalizacaoService personalizacaoService;
  private final PersonalizacaoReceitaService personalizacaoReceitaService;
  private final PersonalizacaoPerfilRepository personalizacaoPerfilRepository;

  @Override
  @Transactional(readOnly = true)
  public Page<ReceitaResponse> feedPersonalizado(Long usuarioId, Pageable pageable) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    Page<FeedPerfilReceitaEntity> feedPerfilReceitas = feedPerfilReceitaRepository
      .findByPerfilId(perfilUsuarioAutenticado.getId(), pageable);

    List<ReceitaEntity> receitas = feedPerfilReceitas.getContent().stream()
      .map(FeedPerfilReceitaEntity::getReceita)
      .toList();

    Set<Long> receitasCurtidas = receitas.isEmpty()
      ? Set.of()
      : Set.copyOf(curtidaReceitaRepository.findReceitaIdsByPerfilIdAndReceitaIdIn(
          perfilUsuarioAutenticado.getId(),
          receitas.stream().map(ReceitaEntity::getId
        ).toList())
      );

    Page<ReceitaEntity> receitasPage = new PageImpl<>(
      receitas,
      feedPerfilReceitas.getPageable(),
      feedPerfilReceitas.getTotalElements()
    );

    Map<Long, List<RestricaoAlimentarResumoResponse>> restricoesAlimentaresPorReceita = restricaoAlimentarReceitaService
      .buscarRestricoesAlimentaresEmLote(receitas.stream().map(ReceitaEntity::getId).toList());

    Map<Long, Boolean> restricoesUsuarioPorReceita = restricaoAlimentarReceitaService
      .buscarRestricoesUsuario(receitas, usuarioId);

    Map<Long, List<PersonalizacaoResumoResponse>> personalizacaoPorReceita = personalizacaoReceitaService
      .buscarPersonalizacoesReceitaEmLote(receitas.stream().map(ReceitaEntity::getId).toList());

    return receitasPage.map(receita -> toResponse(
      receita,
      receitasCurtidas.contains(receita.getId()),
      restricoesAlimentaresPorReceita.getOrDefault(receita.getId(), List.of()),
      restricoesUsuarioPorReceita.getOrDefault(receita.getId(), null),
      Objects.requireNonNullElse(personalizacaoPorReceita.get(receita.getId()), List.of())
    ));
  }

  @Override
  @Transactional(readOnly = true)
  public Page<ReceitaResumoResponse> explorarReceitas(Long usuarioId, String titulo, String tipoRefeicao,
    Pageable pageable) {

    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    List<String> codigosPersonalizacaoPerfil = personalizacaoPerfilRepository
      .findByPerfilId(perfilUsuarioAutenticado.getId())
      .stream()
      .map(vinculo -> vinculo.getPersonalizacao().getCodigo())
      .toList();

    Page<ReceitaEntity> page = codigosPersonalizacaoPerfil.isEmpty()
      ? receitaRepository.buscarExplorar(titulo, tipoRefeicao, pageable)
      : receitaRepository.buscarExplorarPersonalizado(
        titulo,
        tipoRefeicao,
        codigosPersonalizacaoPerfil,
        pageable
      );

    Map<Long, Boolean> restritaPorReceita = restricaoAlimentarReceitaService
      .buscarRestricoesUsuario(page.getContent(), usuarioId);

    return page.map(receita -> new ReceitaResumoResponse(
        receita.getId(),
        receita.getTitulo(),
        null,
        restritaPorReceita.getOrDefault(receita.getId(), null),
        receita.getDataCadastro()
      )
    );
  }

  @Override
  @Transactional(readOnly = true)
  public Page<ReceitaResumoResponse> buscarReceitasPerfil(Long usuarioId, Long perfilId, Pageable pageable) {
    Page<ReceitaEntity> page = receitaRepository.findByPerfilId(perfilId, pageable);

    Map<Long, Boolean> restritaPorReceita = restricaoAlimentarReceitaService.buscarRestricoesUsuario(page.getContent(), usuarioId);

    return page.map(receita -> new ReceitaResumoResponse(
      receita.getId(),
      receita.getTitulo(),
      null,
      restritaPorReceita.getOrDefault(receita.getId(), null),
      receita.getDataCadastro()
    ));
  }

  @Override
  @Transactional(readOnly = true)
  public ReceitaResponse buscarReceita(Long usuarioId, Long receitaId) {
    ReceitaEntity receita = receitaRepository.findById(receitaId)
      .orElseThrow(() -> new ResourceNotFoundException(RECEITA_NAO_ENCONTRADA));

    Boolean curtidoPeloUsuario = perfilRepository.findByUsuarioId(usuarioId)
      .map(perfil -> curtidaReceitaRepository.findByReceitaIdAndPerfilId(receitaId, perfil.getId()).isPresent())
      .orElse(false);

    List<RestricaoAlimentarResumoResponse> restricoes = restricaoAlimentarReceitaService
      .buscarRestricoesAlimentaresEmLote(List.of(receitaId))
      .getOrDefault(receitaId, List.of());

    Boolean restritaParaUsuario = restricaoAlimentarReceitaService.buscarRestricoesUsuario(List.of(receita), usuarioId).get(receitaId);

    List<PersonalizacaoResumoResponse> personalizacao = personalizacaoReceitaService.buscarPersonalizacoesReceita(receitaId);

    return toResponse(
      receita,
      curtidoPeloUsuario,
      restricoes,
      restritaParaUsuario,
      personalizacao);
  }

  @Override
  @Transactional
  public ReceitaResponse criarReceita(Long usuarioId, ReceitaRequest request) {
    log.info("Iniciando processo de criação da receita. usuarioId={}", usuarioId);

    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    List<RestricaoAlimentarEntity> restricoesValidadas = restricaoAlimentarService
      .validarRestricoesAlimentares(request.restricoesAlimentares());

    List<PersonalizacaoEntity> personalizacoesValidadas = personalizacaoService
      .validarPersonalizacoes(request.personalizacoes());

    ReceitaEntity receita = ReceitaEntity.builder()
      .titulo(request.titulo())
      .tipoRefeicao(TipoRefeicaoEnum.valueOf(request.tipoRefeicao()))
      .ingredientes(request.ingredientes())
      .modoPreparo(request.modoPreparo())
      .historia(request.historia())
      .tempoPreparoMin(request.tempoPreparoMin())
      .qtdPorcoes(request.qtdPorcoes())
      .dataCadastro(LocalDateTime.now())
      .ultimaAtualizacao(LocalDateTime.now())
      .perfil(perfilUsuarioAutenticado)
      .build();

    ReceitaEntity receitaSalva = receitaRepository.save(receita);

    List<RestricaoAlimentarResumoResponse> restricoesAlimentares = restricaoAlimentarReceitaService
      .sincronizarRestricoesReceita(receitaSalva, restricoesValidadas);

    personalizacaoReceitaService.sincronizarPersonalizacoesReceita(receitaSalva, personalizacoesValidadas);

    List<PersonalizacaoResumoResponse> personalizacao = personalizacaoReceitaService.buscarPersonalizacoesReceita(receitaSalva.getId());

    feedService.publicarReceitaFeed(perfilUsuarioAutenticado, receitaSalva);

    log.info(
      "Receita criada com sucesso. usuarioId={}, receitaId={}, restricoes={}, personalizacoes={}",
      usuarioId,
      receitaSalva.getId(),
      restricoesValidadas.size(),
      personalizacoesValidadas.size()
    );

    return toResponse(
      receitaSalva,
      null,
      restricoesAlimentares,
      null,
      personalizacao
    );
  }

  @Override
  @Transactional
  public ReceitaResponse editarReceita(Long usuarioId, Long receitaId, ReceitaRequest request) {
    log.info("Atualizando receita. usuarioId={}, receitaId={}", usuarioId, receitaId);

    ReceitaEntity receita = receitaRepository.findByIdWithRestricoes(receitaId)
      .orElseThrow(() -> new ResourceNotFoundException(RECEITA_NAO_ENCONTRADA));

    if (!receita.getPerfil().getUsuarioId().equals(usuarioId)) {
      log.warn(
        "Edição de receita negada por falta de permissão. usuarioId={}, receitaId={}",
        usuarioId,
        receitaId
      );
      throw new ServiceException(SEM_PERMISSAO_EDITAR_RECEITA);
    }

    List<RestricaoAlimentarEntity> restricoesValidadas = restricaoAlimentarService
      .validarRestricoesAlimentares(request.restricoesAlimentares());

    List<PersonalizacaoEntity> personalizacoesValidadas = personalizacaoService
      .validarPersonalizacoes(request.personalizacoes());

    receita.setTitulo(request.titulo());
    receita.setTipoRefeicao(TipoRefeicaoEnum.valueOf(request.tipoRefeicao()));
    receita.setIngredientes(request.ingredientes());
    receita.setModoPreparo(request.modoPreparo());
    receita.setHistoria(request.historia());
    receita.setTempoPreparoMin(request.tempoPreparoMin());
    receita.setQtdPorcoes(request.qtdPorcoes());
    receita.setUltimaAtualizacao(LocalDateTime.now());

    ReceitaEntity receitaAtualizada = receitaRepository.save(receita);

    List<RestricaoAlimentarResumoResponse> restricoesAlimentares = restricaoAlimentarReceitaService
      .sincronizarRestricoesReceita(receitaAtualizada, restricoesValidadas);

    personalizacaoReceitaService.sincronizarPersonalizacoesReceita(receitaAtualizada, personalizacoesValidadas);

    List<PersonalizacaoResumoResponse> personalizacao = personalizacaoReceitaService.buscarPersonalizacoesReceita(receitaAtualizada.getId());

    log.info(
      "Receita atualizada com sucesso. usuarioId={}, receitaId={}, restricoes={}, personalizacoes={}",
      usuarioId,
      receitaAtualizada.getId(),
      restricoesValidadas.size(),
      personalizacoesValidadas.size()
    );

    return toResponse(
      receitaAtualizada,
      null,
      restricoesAlimentares,
      null,
      personalizacao
    );
  }

  @Override
  @Transactional
  public RemoverReceitaResponse removerReceita(Long usuarioId, Long receitaId) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    ReceitaEntity receita = receitaRepository.findById(receitaId)
      .orElseThrow(() -> new ResourceNotFoundException(RECEITA_NAO_ENCONTRADA));

    if (!receita.getPerfil().getId().equals(perfilUsuarioAutenticado.getId())) {
      throw new ServiceException(SEM_PERMISSAO_REMOVER_RECEITA);
    }

    feedService.removerReceitaDoFeed(receita.getId());
    restricaoAlimentarReceitaService.removerRestricoesReceita(receitaId);
    personalizacaoReceitaService.removerVinculosReceita(receitaId);
    receitaRepository.delete(receita);

    return new RemoverReceitaResponse(receitaId, true, "Receita removida com sucesso.");
  }

  @Override
  @Transactional(readOnly = true)
  public Page<ReceitaResponse> buscarReceitasFavoritas(Long usuarioId, Pageable pageable) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    Page<FavoritoReceitaEntity> favoritos = favoritoReceitaRepository
      .findByPerfilId(perfilUsuarioAutenticado.getId(), pageable);

    List<ReceitaEntity> receitas = favoritos.getContent().stream()
      .map(FavoritoReceitaEntity::getReceita)
      .toList();

    Page<ReceitaEntity> receitasPage = new PageImpl<>(
      receitas,
      favoritos.getPageable(),
      favoritos.getTotalElements()
    );

    Set<Long> receitasCurtidas = receitas.isEmpty()
      ? Set.of()
      : Set.copyOf(curtidaReceitaRepository.findReceitaIdsByPerfilIdAndReceitaIdIn(
        perfilUsuarioAutenticado.getId(),
        receitas.stream().map(ReceitaEntity::getId).toList()
      ));

    Map<Long, List<RestricaoAlimentarResumoResponse>> restricoesPorReceita = restricaoAlimentarReceitaService
      .buscarRestricoesAlimentaresEmLote(receitas.stream().map(ReceitaEntity::getId).toList());

    Map<Long, List<PersonalizacaoResumoResponse>> personalizacaoPorReceita =
      personalizacaoReceitaService.buscarPersonalizacoesReceitaEmLote(receitas.stream().map(ReceitaEntity::getId).toList());

    return receitasPage.map(receita -> toResponse(
      receita,
      receitasCurtidas.contains(receita.getId()),
      restricoesPorReceita.getOrDefault(receita.getId(), List.of()),
      null,
      Objects.requireNonNullElse(personalizacaoPorReceita.get(receita.getId()), List.of())
    ));
  }

  private ReceitaResponse toResponse(
    ReceitaEntity receita,
    Boolean curtidoPeloUsuario,
    List<RestricaoAlimentarResumoResponse> restricoesAlimentares,
    Boolean restritaParaUsuario,
    List<PersonalizacaoResumoResponse> personalizacao) {

    Integer curtidas = receita.getCountCurtidas() != null ? receita.getCountCurtidas() : 0;
    Integer comentarios = receita.getCountComentarios() != null ? receita.getCountComentarios() : 0;

    return ReceitaResponse.fromEntity(
      receita,
      curtidas,
      comentarios,
      curtidoPeloUsuario,
      restricoesAlimentares,
      restritaParaUsuario,
      personalizacao
    );
  }

}