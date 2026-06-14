package br.pucgo.ads.projetointegrador.dosecerta.dto;

import br.pucgo.ads.projetointegrador.dosecerta.database.entity.MedicamentoHorario;
import br.pucgo.ads.projetointegrador.dosecerta.database.entity.RegistroTomada;

import java.time.format.DateTimeFormatter;

public class MedicamentoHorarioDTO {

    private Long id;
    private String horario;
    private Boolean tomadoHoje;
    private RegistroTomadaDTO registroTomada;
    private String proximaExecucao;

    public MedicamentoHorarioDTO(MedicamentoHorario horarioEntity, RegistroTomada registro) {
        this.id = horarioEntity.getId();
        this.horario = horarioEntity.getHorario();
        this.tomadoHoje = horarioEntity.getTomadoHoje();
        this.registroTomada = registro != null ? new RegistroTomadaDTO(registro) : null;

        if (horarioEntity.getProximaExecucao() != null) {
            this.proximaExecucao = horarioEntity.getProximaExecucao()
                    .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }
    }

    public Long getId() { return id; }
    public String getHorario() { return horario; }
    public Boolean getTomadoHoje() { return tomadoHoje; }
    public RegistroTomadaDTO getRegistroTomada() { return registroTomada; }
    public String getProximaExecucao() { return proximaExecucao; }
}
