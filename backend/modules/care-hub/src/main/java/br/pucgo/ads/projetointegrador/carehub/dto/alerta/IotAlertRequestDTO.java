package br.pucgo.ads.projetointegrador.carehub.dto.alerta;

import lombok.Data;

@Data
public class IotAlertRequestDTO {
    private String tipo;
    private String observacao;
    private Integer battery;
    private Integer signal;
    private String pressedAt;
}

