package br.com.puc.saborfamilia.service.perfil;

import br.com.puc.saborfamilia.service.perfil.dto.request.PerfilRequest;
import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResponse;
import br.com.puc.saborfamilia.service.perfil.dto.request.EditarPerfilRequest;

public interface PerfilService {

  PerfilResponse buscarMeuPerfil(Long usuarioId);

  PerfilResponse buscarPerfilPublico(Long usuarioId, Long perfilId);

  PerfilResponse criarPerfil(Long usuarioId, PerfilRequest request);

  PerfilResponse editarPerfil(Long usuarioId, EditarPerfilRequest request);

}
