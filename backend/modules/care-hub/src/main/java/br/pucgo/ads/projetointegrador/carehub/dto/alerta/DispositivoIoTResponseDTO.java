package br.pucgo.ads.projetointegrador.carehub.dto.alerta;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class DispositivoIoTResponseDTO {
    private Long id;
    private String nome;
    private String deviceId;
    private Boolean ativo;
    private OffsetDateTime ultimoBatimentoEm;
    private String deviceKeyPlain;
}

