package br.com.puc.saborfamilia.controller;

import br.com.puc.saborfamilia.enums.CategoriaPersonalizacaoEnum;
import br.com.puc.saborfamilia.service.personalizacao.PersonalizacaoService;
import br.com.puc.saborfamilia.service.personalizacao.dto.request.EditarPersonalizacaoRequest;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.CatalogoPersonalizacaoResponse;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.CategoriaPersonalizacaoResponse;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.PersonalizacaoResponse;
import br.com.puc.saborfamilia.service.personalizacao.dto.response.PersonalizacaoResumoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping(value = "/api/sabor-familia/personalizacao")
@Tag(name = "Catálogo de Personalização", description = "Serviços de gerenciamento de personalizações.")
public class PersonalizacaoController {

  private final PersonalizacaoService personalizacaoService;

  @GetMapping(value = "/categorias")
  @Operation(
    summary = "Listar categorias de personalização",
    description = "Retorna a lista de categorias que agrupam as opções."
  )
  public ResponseEntity<List<CategoriaPersonalizacaoResponse>> buscarCategorias() {
    List<CategoriaPersonalizacaoResponse> responses = new ArrayList<>();

    Arrays.stream(CategoriaPersonalizacaoEnum.values()).forEach(
      categoria -> responses.add(
        new CategoriaPersonalizacaoResponse(
          categoria.name(),
          categoria.getLabel(),
          categoria.getDescricao())
      ));

    return ResponseEntity.ok(responses);
  }

  @GetMapping
  @Operation(
    summary = "Listar catálogo de personalização",
    description = "Retorna o catálogo agrupado por categoria."
  )
  public ResponseEntity<List<CatalogoPersonalizacaoResponse>> listarCatalogo() {
    List<CatalogoPersonalizacaoResponse> responses = personalizacaoService.listarCatalogo();
    return ResponseEntity.ok(responses);
  }

  @GetMapping(value = "/perfil")
  @Operation(
    summary = "Listar todas as personalizações de contexto do perfil",
    description = "Retorna o catálogo de personalização do perfil."
  )
  public ResponseEntity<List<PersonalizacaoResumoResponse>> listarCatalogoContextoPerfil() {
    List<PersonalizacaoResumoResponse> responses = personalizacaoService.listarCatalogoContextoPerfil();
    return ResponseEntity.ok(responses);
  }

  @GetMapping(value = "/receita")
  @Operation(
    summary = "Listar todas as personalizações de contexto da receita",
    description = "Retorna o catálogo de personalização da receita."
  )
  public ResponseEntity<List<PersonalizacaoResumoResponse>> listarCatalogoContextoReceita() {
    List<PersonalizacaoResumoResponse> responses = personalizacaoService.listarCatalogoContextoReceita();
    return ResponseEntity.ok(responses);
  }

  @PutMapping(value = "/{codigo}")
  @Operation(
    summary = "Editar opção de personalização",
    description = "Atualiza personalização já cadastrada."
  )
  public ResponseEntity<PersonalizacaoResponse> editarPersonalizacao(
    @PathVariable String codigo,
    @RequestBody EditarPersonalizacaoRequest request
  ) {
    PersonalizacaoResponse response = personalizacaoService.editarPersonalizacao(codigo, request);
    return ResponseEntity.ok(response);
  }

  @PatchMapping(value = "/ativar/{codigo}")
  @Operation(
    summary = "Ativar opção de personalização",
    description = "Define o status de uma personalização como ativa."
  )
  public ResponseEntity<PersonalizacaoResponse> ativarPersonalizacao(@PathVariable String codigo) {
    PersonalizacaoResponse response = personalizacaoService.ativarPersonalizacao(codigo);
    return ResponseEntity.ok(response);
  }

  @PatchMapping(value = "/inativar/{codigo}")
  @Operation(
    summary = "Inativar opção de personalização",
    description = "Define o status de uma personalização como inativa."
  )
  public ResponseEntity<PersonalizacaoResponse> inativarPersonalizacao(@PathVariable String codigo) {
    PersonalizacaoResponse response = personalizacaoService.inativarPersonalizacao(codigo);
    return ResponseEntity.ok(response);
  }

}
