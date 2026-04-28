package br.com.puc.saborfamilia.service.favorito.impl;

import br.com.puc.saborfamilia.database.entity.FavoritoReceitaEntity;
import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.entity.ReceitaEntity;
import br.com.puc.saborfamilia.database.repository.FavoritoReceitaRepository;
import br.com.puc.saborfamilia.database.repository.PerfilRepository;
import br.com.puc.saborfamilia.database.repository.ReceitaRepository;
import br.com.puc.saborfamilia.exception.model.ResourceNotFoundException;
import br.com.puc.saborfamilia.service.favorito.FavoritoService;
import br.com.puc.saborfamilia.service.favorito.dto.FavoritoResponse;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class FavoritoServiceImpl implements FavoritoService {

  private static final String PERFIL_NAO_ENCONTRADO = "Perfil não encontrado para o usuário informado.";
  private static final String RECEITA_NAO_ENCONTRADA = "Receita não encontrada para o ID informado.";

  private final FavoritoReceitaRepository favoritoReceitaRepository;
  private final PerfilRepository perfilRepository;
  private final ReceitaRepository receitaRepository;

  @Override
  @Transactional
  public FavoritoResponse adicionarReceitaFavoritar(Long usuarioId, Long receitaId) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    ReceitaEntity receita = receitaRepository.findById(receitaId)
      .orElseThrow(() -> new ResourceNotFoundException(RECEITA_NAO_ENCONTRADA));

    boolean jaFavoritada = favoritoReceitaRepository
      .findByReceitaIdAndPerfilId(receitaId, perfilUsuarioAutenticado.getId())
      .isPresent();

    if (jaFavoritada) {
      return new FavoritoResponse(receitaId, false, "Esta receita já está nos seus favoritos.");
    }

    FavoritoReceitaEntity favorito = FavoritoReceitaEntity.builder()
      .receita(receita)
      .perfil(perfilUsuarioAutenticado)
      .dataCadastro(LocalDateTime.now())
      .build();

    try {
      favoritoReceitaRepository.save(favorito);
    }
    catch (DataIntegrityViolationException ex) {
      return new FavoritoResponse(receitaId, false, "Esta receita já está nos seus favoritos.");
    }

    return new FavoritoResponse(receitaId, true, "Receita adicionada aos favoritos.");
  }

  @Override
  @Transactional
  public FavoritoResponse removerReceitaFavorita(Long usuarioId, Long receitaId) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    boolean removido = favoritoReceitaRepository.findByReceitaIdAndPerfilId(receitaId, perfilUsuarioAutenticado.getId())
      .map(favorito -> {
        favoritoReceitaRepository.delete(favorito);
        return true;
      })
      .orElse(false);

    String motivo = removido ? "Receita removida dos favoritos." : "Esta receita não estava nos seus favoritos.";
    return new FavoritoResponse(receitaId, false, motivo);
  }

}
