package br.com.puc.saborfamilia.service.restricao;

import br.com.puc.saborfamilia.database.entity.RestricaoAlimentarEntity;
import br.com.puc.saborfamilia.service.restricao.dto.RestricaoAlimentarResponse;
import br.com.puc.saborfamilia.service.restricao.dto.request.EditarRestricaoAlimentarRequest;
import java.util.List;

public interface RestricaoAlimentarService {

  RestricaoAlimentarResponse buscarRestricaoAlimentar(String codigo);

  List<RestricaoAlimentarResponse> buscarRestricoesAlimentares();

  RestricaoAlimentarResponse editarRestricaoAlimentar(String codigo, EditarRestricaoAlimentarRequest request);

  RestricaoAlimentarResponse ativarRestricaoAlimentar(String codigo);

  RestricaoAlimentarResponse inativarRestricaoAlimentar(String codigo);

  List<RestricaoAlimentarEntity> validarRestricoesAlimentares(List<String> restricaoCodigos);

}
