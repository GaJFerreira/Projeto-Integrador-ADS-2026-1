package br.com.puc.saborfamilia.service.perfil;

import br.com.puc.saborfamilia.service.perfil.dto.request.EditarPerfilRequest;
import br.com.puc.saborfamilia.service.perfil.dto.request.PerfilRequest;
import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResumoResponse;
import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface PerfilService {

  PerfilResponse buscarMeuPerfil(Long usuarioId);

  PerfilResponse buscarPerfilPublico(Long usuarioId, Long perfilId);

  Page<PerfilResumoResponse> explorarPerfis(Long usuarioId, String nome, Pageable pageable);

  PerfilResponse criarPerfil(Long usuarioId, PerfilRequest request, MultipartFile fotoPerfil);

  PerfilResponse editarPerfil(Long usuarioId, EditarPerfilRequest request, MultipartFile fotoPerfil);

}
