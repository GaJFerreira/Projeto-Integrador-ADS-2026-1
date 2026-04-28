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
import br.com.puc.saborfamilia.service.receita.dto.response.PerfilComentarioResponse;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class ComentarioServiceImpl implements ComentarioService {

  private static final String PERFIL_NAO_ENCONTRADO = "Perfil não encontrado para o usuário informado.";
  private static final String RECEITA_NAO_ENCONTRADA = "Receita não encontrada para o ID informado.";
  private static final String COMENTARIO_NAO_ENCONTRADO = "Comentário não encontrado para a receita informada.";
  private static final String AUTOR_COMENTARIO_INVALIDO = "O usuário informado não é o autor do comentário.";

  private final ComentarioReceitaRepository comentarioReceitaRepository;
  private final PerfilRepository perfilRepository;
  private final ReceitaRepository receitaRepository;

  @Override
  @Transactional(readOnly = true)
  public List<PerfilComentarioResponse> buscarComentariosReceita(Long receitaId) {
    ReceitaEntity receita = receitaRepository.findById(receitaId)
      .orElseThrow(() -> new ResourceNotFoundException(RECEITA_NAO_ENCONTRADA));

    return comentarioReceitaRepository.findByReceitaIdWithPerfil(receita.getId()).stream()
      .map(PerfilComentarioResponse::fromEntity)
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

    if (!comentario.getPerfil().getId().equals(perfilUsuarioAutenticado.getId())) {
      throw new ServiceException(AUTOR_COMENTARIO_INVALIDO);
    }

    comentarioReceitaRepository.delete(comentario);
    receitaRepository.reduzirContadorComentarios(comentario.getReceita().getId());

    return new RemoverComentarioResponse(comentarioId, true, "Comentário removido.");
  }

}

