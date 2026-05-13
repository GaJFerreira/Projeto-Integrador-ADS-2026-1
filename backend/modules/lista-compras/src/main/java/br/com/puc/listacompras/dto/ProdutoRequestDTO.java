package br.com.puc.listacompras.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoRequestDTO {

  @NotBlank(message = "O nome do produto e obrigatorio")
  @Size(max = 150, message = "O nome deve ter no maximo 150 caracteres")
  private String nome;

  @Positive(message = "O preco deve ser maior que zero")
  private BigDecimal preco;

  @NotNull(message = "O ID da categoria e obrigatorio")
  private Long categoriaId;

  @Size(max = 500, message = "As tags devem ter no maximo 500 caracteres")
  private String tags;

  private Boolean ativo = true;

  private Boolean isPersonalizado = false;

  private String descricao;

  private String unidadeMedida;
}
