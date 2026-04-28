package br.com.puc.saborfamilia.service.personalizacao;

import br.com.puc.saborfamilia.database.entity.PersonalizacaoEntity;
import br.com.puc.saborfamilia.database.entity.ReceitaEntity;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.PersonalizacaoResumoResponse;
import java.util.List;
import java.util.Map;

public interface PersonalizacaoReceitaService {

  void sincronizarPersonalizacoesReceita(ReceitaEntity receita, List<PersonalizacaoEntity> personalizacoes);

  List<PersonalizacaoResumoResponse> buscarPersonalizacoesReceita(Long receitaId);

  Map<Long, List<PersonalizacaoResumoResponse>> buscarPersonalizacoesReceitaEmLote(List<Long> receitaIds);

  void removerVinculosReceita(Long receitaId);

}
