package br.com.puc.saborfamilia.service.favorito;

import br.com.puc.saborfamilia.service.favorito.dto.FavoritoResponse;

public interface FavoritoService {

  FavoritoResponse adicionarReceitaFavoritar(Long usuarioId, Long receitaId);

  FavoritoResponse removerReceitaFavorita(Long usuarioId, Long receitaId);

}
