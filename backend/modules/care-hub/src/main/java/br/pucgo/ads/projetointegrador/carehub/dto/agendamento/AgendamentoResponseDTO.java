package br.pucgo.ads.projetointegrador.carehub.dto.agendamento;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgendamentoResponseDTO {

    private Long id;
    private Long cuidadorId;
    private String cuidadorNome;
    private Long clienteId;
    private String clienteNome;
    private OffsetDateTime dataHoraInicio;
    private OffsetDateTime dataHoraFim;
    private String status;
    private String observacoes;
    private String tipoAtendimento;
    private OffsetDateTime dataSolicitacao;
    private OffsetDateTime proposedDataHoraInicio;
    private OffsetDateTime proposedDataHoraFim;
}

