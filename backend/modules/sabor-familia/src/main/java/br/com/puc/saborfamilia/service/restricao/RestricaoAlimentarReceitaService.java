package br.com.puc.saborfamilia.service.restricao;

import br.com.puc.saborfamilia.database.entity.ReceitaEntity;
import br.com.puc.saborfamilia.database.entity.RestricaoAlimentarEntity;
import br.com.puc.saborfamilia.service.restricao.dto.RestricaoAlimentarResumoResponse;
import java.util.List;
import java.util.Map;

public interface RestricaoAlimentarReceitaService {

  Map<Long, List<RestricaoAlimentarResumoResponse>> buscarRestricoesAlimentaresEmLote(List<Long> receitaIds);

  Map<Long, Boolean> buscarRestricoesUsuario(List<ReceitaEntity> receitas, Long usuarioId);

  List<RestricaoAlimentarResumoResponse> sincronizarRestricoesReceita(ReceitaEntity receita, List<RestricaoAlimentarEntity> restricoesAlimentares);

  void removerRestricoesReceita(Long receitaId);

}
