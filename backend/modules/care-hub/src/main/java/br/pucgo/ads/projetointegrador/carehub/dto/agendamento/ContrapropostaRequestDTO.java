package br.pucgo.ads.projetointegrador.carehub.dto.agendamento;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContrapropostaRequestDTO {
    private OffsetDateTime dataHoraInicio;
    private OffsetDateTime dataHoraFim;
}

