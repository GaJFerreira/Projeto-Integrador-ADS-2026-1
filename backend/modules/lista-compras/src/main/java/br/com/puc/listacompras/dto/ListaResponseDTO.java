package br.com.puc.listacompras.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListaResponseDTO {

  private Long id;
  private String titulo;
  private Long usuarioId;
  private Long patologiaId;
  private Boolean template;
  private LocalDateTime createdAt;

  private String descricao;
  private String status;
  private List<ItemListaResponseDTO> itens;
}
