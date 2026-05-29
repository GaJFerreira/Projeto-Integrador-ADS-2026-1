package br.com.puc.saborfamilia.controller;

import br.com.puc.saborfamilia.enums.TipoEntidadeEnum;
import br.com.puc.saborfamilia.service.midia.MidiaService;
import br.com.puc.saborfamilia.utils.JwtClaimsUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping(value = "/api/sabor-familia/midia")
@Tag(name = "Mídia", description = "Download de imagens de perfil e receitas.")
public class MidiaController {

  private final MidiaService midiaService;

  @GetMapping(value = "/perfil/{perfilId}")
  @Operation(
    summary = "Buscar imagem de um perfil",
    description = "Retorna os bytes referentes a imagem do perfil."
  )
  public ResponseEntity<byte[]> buscarMidiaPerfil(
    @RequestHeader(value = "Authorization") String authorization,
    @PathVariable Long perfilId
  ) {
    JwtClaimsUtils.getUserId(authorization);
    return midiaService.buscarMidia(TipoEntidadeEnum.PERFIL, perfilId);
  }

  @GetMapping(value = "/receita/{receitaId}")
  @Operation(
    summary = "Buscar imagem de uma receita",
    description = "Retorna os bytes referentes a imagem da receita."
  )
  public ResponseEntity<byte[]> buscarMidiaReceita(
    @RequestHeader(value = "Authorization") String authorization,
    @PathVariable Long receitaId
  ) {
    JwtClaimsUtils.getUserId(authorization);
    return midiaService.buscarMidia(TipoEntidadeEnum.RECEITA, receitaId);
  }

}
