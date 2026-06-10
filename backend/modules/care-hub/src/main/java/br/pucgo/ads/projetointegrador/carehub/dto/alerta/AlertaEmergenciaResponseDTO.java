package br.pucgo.ads.projetointegrador.carehub.dto.alerta;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class AlertaEmergenciaResponseDTO {
    private Long id;
    private String status;
    private String tipo;
    private String origem;
    private String observacao;
    private Long clienteId;
    private String clienteNome;
    private Long dispositivoId;
    private String deviceId;
    private String dispositivoNome;
    private OffsetDateTime criadoEm;
    private OffsetDateTime reconhecidoEm;
}

