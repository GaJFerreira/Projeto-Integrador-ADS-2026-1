package br.com.puc.saborfamilia.service.seguindo.impl;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.repository.PerfilRepository;
import br.com.puc.saborfamilia.database.repository.SeguindoRepository;
import br.com.puc.saborfamilia.exception.model.ResourceNotFoundException;
import br.com.puc.saborfamilia.service.feed.FeedService;
import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResumoResponse;
import br.com.puc.saborfamilia.service.seguindo.SeguindoService;
import br.com.puc.saborfamilia.service.seguindo.dto.SeguindoResponse;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class SeguindoServiceImpl implements SeguindoService {

  private static final String PERFIL_NAO_ENCONTRADO = "Perfil não encontrado para o usuário informado.";
  private static final String PERFIL_SEGUIDO_NAO_ENCONTRADO = "O perfil a ser seguido não foi encontrado";

  private final SeguindoRepository seguindoRepository;
  private final PerfilRepository perfilRepository;
  private final FeedService feedService;

  @Override
  @Transactional(readOnly = true)
  public Page<PerfilResumoResponse> buscarSeguidores(Long perfilId, Pageable pageable) {
    PerfilEntity perfil = perfilRepository.findById(perfilId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    return seguindoRepository.findBySeguidoIdOrderByDataCadastroDesc(perfil.getId(), pageable)
      .map(seguindo -> PerfilResumoResponse.fromEntity(seguindo.getSeguidor()));
  }

  @Override
  @Transactional(readOnly = true)
  public Page<PerfilResumoResponse> buscarSeguindo(Long perfilId, Pageable pageable) {
    PerfilEntity perfil = perfilRepository.findById(perfilId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    return seguindoRepository.findBySeguidorIdOrderByDataCadastroDesc(perfil.getId(), pageable)
      .map(seguindo -> PerfilResumoResponse.fromEntity(seguindo.getSeguido()));
  }

  @Override
  @Transactional
  public SeguindoResponse seguirPerfil(Long usuarioId, Long seguidoPerfilId) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    PerfilEntity seguido = perfilRepository.findById(seguidoPerfilId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_SEGUIDO_NAO_ENCONTRADO));

    if (perfilUsuarioAutenticado.getId().equals(seguido.getId())) {
      return new SeguindoResponse(seguidoPerfilId, false, "Usuário não pode seguir a si mesmo.");
    }

    int inseridos = seguindoRepository.insertIgnoringConflicts(
      perfilUsuarioAutenticado.getId(),
      seguido.getId(),
      LocalDateTime.now()
    );

    if (inseridos > 0) {
      feedService.popularFeedSeguidores(perfilUsuarioAutenticado, seguido);
    }

    boolean usuarioJaSeguia = inseridos == 0;

    String mensagem = usuarioJaSeguia ? "Usuário já segue este perfil." : "Perfil seguido com sucesso.";

    return new SeguindoResponse(seguidoPerfilId, true, mensagem);
  }

  @Override
  @Transactional
  public SeguindoResponse deixarSeguirPerfil(Long usuarioId, Long seguidoPerfilId) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    boolean seguindoUsuario = seguindoRepository
      .existsBySeguidorIdAndSeguidoId(perfilUsuarioAutenticado.getId(), seguidoPerfilId);

    if (!seguindoUsuario) {
      return new SeguindoResponse(seguidoPerfilId, false, "Usuário não seguia este perfil.");
    }

    seguindoRepository.deleteBySeguidorIdAndSeguidoId(perfilUsuarioAutenticado.getId(), seguidoPerfilId);
    feedService.removerReceitasDoSeguidoNoFeed(perfilUsuarioAutenticado.getId(), seguidoPerfilId);

    return new SeguindoResponse(seguidoPerfilId, false, "Deixou de seguir o perfil.");
  }

}
