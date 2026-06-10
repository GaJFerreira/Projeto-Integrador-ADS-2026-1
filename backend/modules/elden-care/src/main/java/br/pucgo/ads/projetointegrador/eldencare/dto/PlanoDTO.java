package br.pucgo.ads.projetointegrador.eldencare.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PlanoDTO(
        UUID id,
        UUID participanteId,
        LocalDate mes,
        String objetivo,
        String nivel,
        Integer freqSemana,
        Integer tempoSessaoMin,
        List<ItemPlanoDTO> itens
) {}
