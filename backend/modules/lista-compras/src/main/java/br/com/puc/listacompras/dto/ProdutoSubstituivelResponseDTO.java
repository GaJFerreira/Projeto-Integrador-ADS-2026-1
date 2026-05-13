package br.com.puc.listacompras.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoSubstituivelResponseDTO {

  private Long produtoAlertadoId;
  private String produtoAlertadoNome;
  private PatologiaResponseDTO patologia;
  private ProdutoResponseDTO produtoSugestao;
}
