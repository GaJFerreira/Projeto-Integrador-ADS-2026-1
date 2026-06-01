package br.pucgo.ads.projetointegrador.carehub.dto.registro;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroAcompanhamentoRequestDTO {

    @NotNull(message = "Agendamento e obrigatorio")
    private Long agendamentoId;

    private OffsetDateTime dataHoraRegistro;
    private String pressaoArterial;
    private String glicemia;
    private String medicamentosAdministrados;
    private String alimentacao;
    private String atividadesRealizadas;

    @NotNull(message = "Observacoes sao obrigatorias")
    private String observacoes;

    private String intercorrencias;
    private String sinaisVitais;
}

