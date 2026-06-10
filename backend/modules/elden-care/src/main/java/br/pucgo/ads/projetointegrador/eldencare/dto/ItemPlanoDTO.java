package br.pucgo.ads.projetointegrador.eldencare.dto;

import java.util.UUID;

public record ItemPlanoDTO(
        String dataOuOrdem,
        Integer ordem,
        UUID exercicioId,
        String exercicioNome,
        Integer series,
        Integer repeticoes,
        Integer duracaoSeg
) {}
