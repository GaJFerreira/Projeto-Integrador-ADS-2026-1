package br.pucgo.ads.projetointegrador.plataforma.dto;

import lombok.Data;

@Data
public class FaqItemDto {
    private Long id;
    private String modulo;
    private String cor;
    private String pergunta;
    private String resposta;
}
