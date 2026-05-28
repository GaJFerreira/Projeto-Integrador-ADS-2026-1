package br.com.puc.saborfamilia.service.seguindo;

import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResumoResponse;
import br.com.puc.saborfamilia.service.seguindo.dto.SeguindoResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SeguindoService {

  Page<PerfilResumoResponse> buscarSeguidores(Long perfilId, Long usuarioId, Pageable pageable);

  Page<PerfilResumoResponse> buscarSeguindo(Long perfilId, Long usuarioId, Pageable pageable);

  SeguindoResponse seguirPerfil(Long usuarioId, Long seguidoPerfilId);

  SeguindoResponse deixarSeguirPerfil(Long usuarioId, Long seguidoPerfilId);

}
