package br.com.puc.listacompras.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ListaCreateRequestDTO {

  @NotBlank(message = "O titulo da lista e obrigatorio")
  @Size(max = 150, message = "O titulo da lista deve ter no maximo 150 caracteres")
  private String titulo;

  private List<ListaItemCreateDTO> itens;
  private Boolean isTemplate;
  private Long patologiaId;
}
