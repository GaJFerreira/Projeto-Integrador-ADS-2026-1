package br.com.puc.saborfamilia.service.perfil.impl;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.entity.PersonalizacaoEntity;
import br.com.puc.saborfamilia.database.entity.RestricaoAlimentarEntity;
import br.com.puc.saborfamilia.database.repository.PerfilRepository;
import br.com.puc.saborfamilia.database.repository.PersonalizacaoPerfilRepository;
import br.com.puc.saborfamilia.database.repository.SeguindoRepository;
import br.com.puc.saborfamilia.exception.model.ResourceNotFoundException;
import br.com.puc.saborfamilia.exception.model.ServiceException;
import br.com.puc.saborfamilia.enums.TipoEntidadeEnum;
import br.com.puc.saborfamilia.service.midia.MidiaService;
import br.com.puc.saborfamilia.service.perfil.PerfilService;
import br.com.puc.saborfamilia.service.perfil.dto.request.EditarPerfilRequest;
import br.com.puc.saborfamilia.service.perfil.dto.request.PerfilRequest;
import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResumoResponse;
import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResponse;
import br.com.puc.saborfamilia.service.personalizacao.PersonalizacaoPerfilService;
import br.com.puc.saborfamilia.service.seguindo.SeguindoService;
import br.com.puc.saborfamilia.service.personalizacao.PersonalizacaoService;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.PersonalizacaoResumoResponse;
import br.com.puc.saborfamilia.service.restricao.RestricaoAlimentarService;
import br.com.puc.saborfamilia.service.restricao.RestricaoAlimentarPerfilService;
import br.com.puc.saborfamilia.service.restricao.dto.RestricaoAlimentarResumoResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@AllArgsConstructor
public class PerfilServiceImpl implements PerfilService {

  private static final String PERFIL_NAO_ENCONTRADO = "Perfil não encontrado para o usuário informado.";
  private static final String PERFIL_PUBLICO_NAO_ENCONTRADO = "O perfil desejado não foi encontrado.";
  private static final String USUARIO_JA_CADASTRADO = "O usuário informado já possui cadastro na plataforma.";
  private static final String EMAIL_JA_CADASTRADO = "O e-mail informado já está sendo utilizado.";

  private final PerfilRepository perfilRepository;
  private final PersonalizacaoPerfilRepository personalizacaoPerfilRepository;
  private final SeguindoRepository seguindoRepository;
  private final SeguindoService seguindoService;
  private final RestricaoAlimentarPerfilService restricaoAlimentarPerfilService;
  private final RestricaoAlimentarService restricaoAlimentarService;
  private final PersonalizacaoService personalizacaoService;
  private final PersonalizacaoPerfilService personalizacaoPerfilService;
  private final MidiaService midiaService;

  @Override
  @Transactional(readOnly = true)
  public PerfilResponse buscarMeuPerfil(Long usuarioId) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioIdWithRestricoes(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    long seguidores = seguindoRepository.countBySeguidoId(perfilUsuarioAutenticado.getId());
    long seguindo = seguindoRepository.countBySeguidorId(perfilUsuarioAutenticado.getId());

    List<RestricaoAlimentarResumoResponse> restricoes = perfilUsuarioAutenticado
      .getRestricoesAlimentares()
      .stream()
      .map(RestricaoAlimentarResumoResponse::fromEntity)
      .toList();

    return toResponse(perfilUsuarioAutenticado, true, null, seguidores, seguindo, restricoes);
  }

  @Override
  @Transactional(readOnly = true)
  public PerfilResponse buscarPerfilPublico(Long usuarioId, Long perfilId) {
    PerfilEntity perfilPublico = perfilRepository.findByIdWithRestricoes(perfilId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_PUBLICO_NAO_ENCONTRADO));

    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    boolean perfilProprio = perfilUsuarioAutenticado.getId().equals(perfilPublico.getId());

    long seguidores = seguindoRepository.countBySeguidoId(perfilPublico.getId());
    long seguindo = seguindoRepository.countBySeguidorId(perfilPublico.getId());

    Boolean seguindoPerfil = null;

    if (!perfilProprio) {
      seguindoPerfil = seguindoRepository
        .existsBySeguidorIdAndSeguidoId(perfilUsuarioAutenticado.getId(), perfilPublico.getId());
    }

    List<RestricaoAlimentarResumoResponse> restricoesAlimentares = perfilPublico
      .getRestricoesAlimentares()
      .stream()
      .map(RestricaoAlimentarResumoResponse::fromEntity)
      .toList();

    return toResponse(perfilPublico, perfilProprio, seguindoPerfil, seguidores, seguindo, restricoesAlimentares);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<PerfilResumoResponse> explorarPerfis(Long usuarioId, String nome, Pageable pageable) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    List<String> codigosPersonalizacaoPerfil = personalizacaoPerfilRepository
      .findByPerfilId(perfilUsuarioAutenticado.getId())
      .stream()
      .map(vinculo -> vinculo.getPersonalizacao().getCodigo())
      .toList();

    Page<PerfilEntity> page = codigosPersonalizacaoPerfil.isEmpty()
      ? perfilRepository.buscarExplorar(perfilUsuarioAutenticado.getId(), nome, pageable)
      : perfilRepository.buscarExplorarPersonalizado(
        perfilUsuarioAutenticado.getId(),
        nome,
        codigosPersonalizacaoPerfil,
        pageable
      );

    return seguindoService.criarPaginaPerfilResumo(page, usuarioId);
  }

  @Override
  @Transactional
  public PerfilResponse criarPerfil(Long usuarioId, PerfilRequest request, MultipartFile fotoPerfil) {
    log.info("Iniciando processo de cadastro do novo perfil. usuarioId={}", usuarioId);

    Optional<PerfilEntity> perfilCadastrado = perfilRepository.findByUsuarioId(usuarioId);

    if (perfilCadastrado.isPresent()) {
      log.warn("Usuário já cadastrado na plataforma. usuarioId={}", usuarioId);
      throw new ServiceException(USUARIO_JA_CADASTRADO);
    }

    boolean emailCadastrado = perfilRepository.existsByEmail(request.email());

    if (emailCadastrado) {
      log.warn("E-mail já cadastrado ao criar perfil. usuarioId={}", usuarioId);
      throw new ServiceException(EMAIL_JA_CADASTRADO);
    }

    List<RestricaoAlimentarEntity> restricoesValidadas = restricaoAlimentarService
      .validarRestricoesAlimentares(request.restricoesAlimentares());

    List<PersonalizacaoEntity> personalizacoesValidadas = personalizacaoService
      .validarPersonalizacoes(request.personalizacoes());

    PerfilEntity perfil = PerfilEntity.builder()
      .usuarioId(usuarioId)
      .nome(request.nome())
      .email(request.email())
      .dataNascimento(request.dataNascimento())
      .bio(request.bio())
      .dataCadastro(LocalDateTime.now())
      .ultimaAtualizacao(LocalDateTime.now())
      .build();

    PerfilEntity perfilSalvo = perfilRepository.save(perfil);

    restricaoAlimentarPerfilService.sincronizarRestricoesPerfil(perfilSalvo, restricoesValidadas);
    personalizacaoPerfilService.sincronizarPersonalizacoesPerfil(perfilSalvo, personalizacoesValidadas);

    salvarMidiaPerfil(usuarioId, fotoPerfil);

    log.info(
      "Perfil criado com sucesso. usuarioId={}, perfilId={}, restricoes={}, personalizacoes={}",
      usuarioId,
      perfilSalvo.getId(),
      restricoesValidadas.size(),
      personalizacoesValidadas.size()
    );

    List<RestricaoAlimentarResumoResponse> restricoesAlimentares = restricoesValidadas.stream()
      .map(r -> RestricaoAlimentarResumoResponse.fromEntity(r, r.getLabelPerfil()))
      .toList();

    return toResponse(perfilSalvo, true, null, 0, 0, restricoesAlimentares);
  }

  @Override
  @Transactional
  public PerfilResponse editarPerfil(Long usuarioId, EditarPerfilRequest request, MultipartFile fotoPerfil) {
    log.info("Iniciando processo de atualização do perfil. usuarioId={}", usuarioId);

    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    List<RestricaoAlimentarEntity> restricoesValidadas = restricaoAlimentarService
      .validarRestricoesAlimentares(request.restricoesAlimentares());

    List<PersonalizacaoEntity> personalizacoesValidadas = personalizacaoService
      .validarPersonalizacoes(request.personalizacoes());

    perfilUsuarioAutenticado.setBio(request.bio());
    perfilUsuarioAutenticado.setUltimaAtualizacao(LocalDateTime.now());

    restricaoAlimentarPerfilService.sincronizarRestricoesPerfil(perfilUsuarioAutenticado, restricoesValidadas);
    personalizacaoPerfilService.sincronizarPersonalizacoesPerfil(perfilUsuarioAutenticado, personalizacoesValidadas);

    perfilRepository.save(perfilUsuarioAutenticado);

    salvarMidiaPerfil(usuarioId, fotoPerfil);

    log.info(
      "Perfil atualizado com sucesso. usuarioId={}, perfilId={}, restricoes={}, personalizacoes={}",
      usuarioId,
      perfilUsuarioAutenticado.getId(),
      restricoesValidadas.size(),
      personalizacoesValidadas.size()
    );

    long seguidores = seguindoRepository.countBySeguidoId(perfilUsuarioAutenticado.getId());
    long seguindo = seguindoRepository.countBySeguidorId(perfilUsuarioAutenticado.getId());

    List<RestricaoAlimentarResumoResponse> restricoesAlimentares = restricoesValidadas.stream()
      .map(r -> RestricaoAlimentarResumoResponse.fromEntity(r, r.getLabelPerfil()))
      .toList();

    return toResponse(perfilUsuarioAutenticado, true, null, seguidores, seguindo, restricoesAlimentares);
  }

  private void salvarMidiaPerfil(Long usuarioId, MultipartFile fotoPerfil) {
    if (fotoPerfil != null && !fotoPerfil.isEmpty()) {
      midiaService.salvarMidia(usuarioId, TipoEntidadeEnum.PERFIL, null, fotoPerfil);
    }
  }

  private PerfilResponse toResponse(
    PerfilEntity perfil,
    Boolean proprioPerfil,
    Boolean seguindoPerfil,
    long seguidores,
    long seguindo,
    List<RestricaoAlimentarResumoResponse> restricoes
  ) {

    List<PersonalizacaoResumoResponse> personalizacao = personalizacaoPerfilService
      .buscarPersonalizacoesPerfil(perfil.getId());

    return PerfilResponse.fromEntity(
      perfil,
      proprioPerfil,
      seguindoPerfil,
      seguidores,
      seguindo,
      midiaService.possuiMidia(TipoEntidadeEnum.PERFIL, perfil.getId()),
      restricoes,
      personalizacao
    );
  }

}