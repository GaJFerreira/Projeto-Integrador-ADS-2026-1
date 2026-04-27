package br.com.puc.saborfamilia.service.receita;

import br.com.puc.saborfamilia.service.receita.dto.request.ReceitaRequest;
import br.com.puc.saborfamilia.service.receita.dto.response.ReceitaResponse;
import br.com.puc.saborfamilia.service.receita.dto.response.ReceitaResumoResponse;
import br.com.puc.saborfamilia.service.receita.dto.response.RemoverReceitaResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReceitaService {

  Page<ReceitaResponse> feedPersonalizado(Long usuarioId, Pageable pageable);

  Page<ReceitaResumoResponse> explorarReceitas(Long usuarioId, String titulo, String tipoRefeicao, Pageable pageable);

  Page<ReceitaResumoResponse> buscarReceitasPerfil(Long usuarioId, Long perfilId, Pageable pageable);

  ReceitaResponse buscarReceita(Long usuarioId, Long receitaId);

  Page<ReceitaResponse> buscarReceitasFavoritas(Long usuarioId, Pageable pageable);

  ReceitaResponse criarReceita(Long usuarioId, ReceitaRequest request);

  ReceitaResponse editarReceita(Long usuarioId, Long receitaId, ReceitaRequest request);

  RemoverReceitaResponse removerReceita(Long usuarioId, Long receitaId);

}
