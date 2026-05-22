package br.pucgo.ads.projetointegrador.carehub.dto.agendamento;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgendamentoRequestDTO {

    @NotNull(message = "Cuidador Ã© obrigatÃ³rio")
    private Long cuidadorId;

    @NotNull(message = "Cliente Ã© obrigatÃ³rio")
    private Long clienteId;

    @NotNull(message = "Data/hora de inÃ­cio Ã© obrigatÃ³ria")
    private OffsetDateTime dataHoraInicio;

    @NotNull(message = "Data/hora de fim Ã© obrigatÃ³ria")
    private OffsetDateTime dataHoraFim;

    private String observacoes;
    private String tipoAtendimento;
}

