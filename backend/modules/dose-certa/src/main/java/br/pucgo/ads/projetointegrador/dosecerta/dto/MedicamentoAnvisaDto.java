package br.pucgo.ads.projetointegrador.dosecerta.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicamentoAnvisaDto {
    private Long id;
    private String nomeProduto;
    private Boolean farmaciaPopular;
}