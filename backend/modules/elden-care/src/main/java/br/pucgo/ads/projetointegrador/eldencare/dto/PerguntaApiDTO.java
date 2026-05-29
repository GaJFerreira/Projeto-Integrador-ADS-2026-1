package br.pucgo.ads.projetointegrador.eldencare.dto;

import java.util.List;

public record PerguntaApiDTO(
        String id,
        String slug,
        String enunciado,
        String tipo,
        Integer ordem,
        List<OpcaoApiDTO> opcoes
) {}
