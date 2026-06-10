package br.com.puc.saborfamilia.controller;

import br.com.puc.saborfamilia.enums.ContextoMidiaEnum;
import br.com.puc.saborfamilia.enums.TipoEntidadeEnum;
import br.com.puc.saborfamilia.service.midia.GerenciadorMidiaService;
import br.com.puc.saborfamilia.utils.JwtClaimsUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping(value = "/api/sabor-familia/midia")
@Tag(name = "Gerenciador de Mídias", description = "Download de imagens de perfil e receitas.")
public class GerenciadorMidiaController {

  private final GerenciadorMidiaService gerenciadorMidiaService;

  @GetMapping(value = "/perfil/{perfilId}")
  @Operation(
    summary = "Buscar imagem de um perfil",
    description = "Retorna a imagem redimensionada conforme o contexto de uso."
  )
  public ResponseEntity<byte[]> buscarMidiaPerfil(
    @RequestHeader(value = "Authorization") String authorization,
    @PathVariable Long perfilId,
    @RequestParam String contexto
  ) {
    JwtClaimsUtils.getUserId(authorization);
    ContextoMidiaEnum contextoMidia = ContextoMidiaEnum.parseContextoMidia(TipoEntidadeEnum.PERFIL, contexto);
    return gerenciadorMidiaService.buscarMidia(TipoEntidadeEnum.PERFIL, perfilId, contextoMidia);
  }

  @GetMapping(value = "/receita/{receitaId}")
  @Operation(
    summary = "Buscar imagem de uma receita",
    description = "Retorna a capa redimensionada conforme o contexto de uso."
  )
  public ResponseEntity<byte[]> buscarMidiaReceita(
    @RequestHeader(value = "Authorization") String authorization,
    @PathVariable Long receitaId,
    @RequestParam String contexto
  ) {
    JwtClaimsUtils.getUserId(authorization);
    ContextoMidiaEnum contextoMidia = ContextoMidiaEnum.parseContextoMidia(TipoEntidadeEnum.RECEITA, contexto);
    return gerenciadorMidiaService.buscarMidia(TipoEntidadeEnum.RECEITA, receitaId, contextoMidia);
  }

}
