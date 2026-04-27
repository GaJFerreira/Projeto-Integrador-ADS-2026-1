package br.com.puc.saborfamilia.service.personalizacao;

import br.com.puc.saborfamilia.database.entity.PersonalizacaoEntity;
import br.com.puc.saborfamilia.service.personalizacao.dto.request.EditarPersonalizacaoRequest;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.CatalogoPersonalizacaoResponse;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.PersonalizacaoResponse;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.PersonalizacaoResumoResponse;
import java.util.List;

public interface PersonalizacaoService {

  List<CatalogoPersonalizacaoResponse> listarCatalogo();

  List<PersonalizacaoResumoResponse> listarCatalogoContextoPerfil();

  List<PersonalizacaoResumoResponse> listarCatalogoContextoReceita();

  PersonalizacaoResponse editarPersonalizacao(String codigo, EditarPersonalizacaoRequest request);

  PersonalizacaoResponse ativarPersonalizacao(String codigo);

  PersonalizacaoResponse inativarPersonalizacao(String codigo);

  List<PersonalizacaoEntity> validarPersonalizacoes(List<String> codigosPersonalizacao);

}
