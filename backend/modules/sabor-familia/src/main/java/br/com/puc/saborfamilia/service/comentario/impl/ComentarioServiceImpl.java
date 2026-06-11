package br.com.puc.saborfamilia.service.comentario.impl;

import br.com.puc.saborfamilia.database.entity.ComentarioReceitaEntity;
import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.entity.ReceitaEntity;
import br.com.puc.saborfamilia.database.repository.ComentarioReceitaRepository;
import br.com.puc.saborfamilia.database.repository.PerfilRepository;
import br.com.puc.saborfamilia.database.repository.ReceitaRepository;
import br.com.puc.saborfamilia.exception.model.ResourceNotFoundException;
import br.com.puc.saborfamilia.exception.model.ServiceException;
import br.com.puc.saborfamilia.service.comentario.ComentarioService;
import br.com.puc.saborfamilia.service.comentario.dto.request.ComentarioRequest;
import br.com.puc.saborfamilia.service.comentario.dto.response.ComentarioResponse;
import br.com.puc.saborfamilia.service.comentario.dto.response.RemoverComentarioResponse;
import br.com.puc.saborfamilia.enums.TipoEntidadeEnum;
import br.com.puc.saborfamilia.service.midia.GerenciadorMidiaService;
import br.com.puc.saborfamilia.service.receita.dto.response.PerfilComentarioResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class ComentarioServiceImpl implements ComentarioService {

  private static final String PERFIL_NAO_ENCONTRADO = "Perfil não encontrado para o usuário informado.";
  private static final String RECEITA_NAO_ENCONTRADA = "Receita não encontrada para o ID informado.";
  private static final String COMENTARIO_NAO_ENCONTRADO = "Comentário não encontrado para a receita informada.";
  private static final String SEM_PERMISSAO_REMOVER_COMENTARIO =
    "Você não tem permissão para remover este comentário.";

  private final ComentarioReceitaRepository comentarioReceitaRepository;
  private final PerfilRepository perfilRepository;
  private final ReceitaRepository receitaRepository;
  private final GerenciadorMidiaService gerenciadorMidiaService;

  @Override
  @Transactional(readOnly = true)
  public List<PerfilComentarioResponse> buscarComentariosReceita(Long receitaId) {
    ReceitaEntity receita = receitaRepository.findById(receitaId)
      .orElseThrow(() -> new ResourceNotFoundException(RECEITA_NAO_ENCONTRADA));

    List<ComentarioReceitaEntity> comentarios = comentarioReceitaRepository.findByReceitaIdWithPerfil(receita.getId());

    Set<Long> perfisComFoto = comentarios.isEmpty()
      ? Set.of()
      : gerenciadorMidiaService.buscarEntidadeIdsComMidia(
        TipoEntidadeEnum.PERFIL,
        comentarios.stream().map(c -> c.getPerfil().getId()).distinct().toList()
      );

    return comentarios.stream()
      .map(comentario -> {
        PerfilEntity perfil = comentario.getPerfil();
        return new PerfilComentarioResponse(
          comentario.getId(),
          perfil.getId(),
          perfil.getNome(),
          perfisComFoto.contains(perfil.getId()),
          comentario.getTexto(),
          comentario.getDataCadastro()
        );
      })
      .toList();
  }

  @Override
  @Transactional
  public ComentarioResponse adicionarComentario(Long usuarioId, Long receitaId, ComentarioRequest request) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    ReceitaEntity receita = receitaRepository.findById(receitaId)
      .orElseThrow(() -> new ResourceNotFoundException(RECEITA_NAO_ENCONTRADA));

    ComentarioReceitaEntity comentario = ComentarioReceitaEntity.builder()
      .receita(receita)
      .perfil(perfilUsuarioAutenticado)
      .texto(request.comentario())
      .dataCadastro(LocalDateTime.now())
      .build();

    ComentarioReceitaEntity comentarioSalvo = comentarioReceitaRepository.save(comentario);
    receitaRepository.aumentarContadorComentarios(receita.getId());

    return ComentarioResponse.fromEntity(comentarioSalvo);
  }

  @Override
  @Transactional
  public RemoverComentarioResponse removerComentario(Long usuarioId, Long receitaId, Long comentarioId) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    ComentarioReceitaEntity comentario = comentarioReceitaRepository
      .findByIdAndReceitaId(comentarioId, receitaId)
      .orElseThrow(() -> new ResourceNotFoundException(COMENTARIO_NAO_ENCONTRADO));

    ReceitaEntity receita = comentario.getReceita();
    
    boolean isAutorComentario = comentario.getPerfil().getId().equals(perfilUsuarioAutenticado.getId());
    boolean isDonoReceita = receita.getPerfil().getId().equals(perfilUsuarioAutenticado.getId());

    if (!isAutorComentario && !isDonoReceita) {
      throw new ServiceException(SEM_PERMISSAO_REMOVER_COMENTARIO);
    }

    Long receitaIdDoComentario = receita.getId();
    comentarioReceitaRepository.delete(comentario);
    receitaRepository.reduzirContadorComentarios(receitaIdDoComentario);

    return new RemoverComentarioResponse(comentarioId, true, "Comentário removido.");
  }

}

