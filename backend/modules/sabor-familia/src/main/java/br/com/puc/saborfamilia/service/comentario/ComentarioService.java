package br.com.puc.saborfamilia.service.comentario;

import br.com.puc.saborfamilia.service.comentario.dto.request.ComentarioRequest;
import br.com.puc.saborfamilia.service.comentario.dto.response.ComentarioResponse;
import br.com.puc.saborfamilia.service.comentario.dto.response.RemoverComentarioResponse;
import br.com.puc.saborfamilia.service.receita.dto.response.PerfilComentarioResponse;
import java.util.List;

public interface ComentarioService {

  List<PerfilComentarioResponse> buscarComentariosReceita(Long receitaId);

  ComentarioResponse adicionarComentario(Long usuarioId, Long receitaId, ComentarioRequest request);

  RemoverComentarioResponse removerComentario(Long usuarioId, Long receitaId, Long comentarioId);

}

