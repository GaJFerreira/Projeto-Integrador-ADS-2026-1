package br.pucgo.ads.projetointegrador.eldencare.dto;

import java.util.List;

public record CategoriaApiDTO(
        String id,
        String titulo,
        String emoji,
        List<PerguntaApiDTO> perguntas
) {}
