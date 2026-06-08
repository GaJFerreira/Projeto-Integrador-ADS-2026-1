package br.pucgo.ads.projetointegrador.carehub.dto.alerta;

import lombok.Data;

@Data
public class DispositivoIoTCreateRequestDTO {
    private String nome;
    private String deviceId;
    private String deviceKey;
}

