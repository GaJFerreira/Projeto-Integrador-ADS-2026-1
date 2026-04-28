package br.com.puc.saborfamilia.service.curtida;

import br.com.puc.saborfamilia.service.curtida.dto.CurtidaResponse;
import br.com.puc.saborfamilia.service.receita.dto.response.PerfilCurtidaResponse;
import java.util.List;

public interface CurtidaService {

  List<PerfilCurtidaResponse> buscarPerfilCurtidasReceita(Long receitaId);

  CurtidaResponse adicionarCurtidaReceita(Long usuarioId, Long receitaId);

  CurtidaResponse removerCurtidaReceita(Long usuarioId, Long receitaId);

}

