package br.pucgo.ads.projetointegrador.dosecerta.dto;

import br.pucgo.ads.projetointegrador.dosecerta.database.entity.Medicamento;
import br.pucgo.ads.projetointegrador.dosecerta.database.entity.MedicamentoHorario;
import br.pucgo.ads.projetointegrador.dosecerta.database.entity.RegistroTomada;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

public class MedicamentoResponseDTO {

    private Long id;
    private String nome;
    private String tarja;
    private Boolean contatarEmergencia;
    private Integer diasRestantes;
    private List<MedicamentoHorarioDTO> horarios;

    public MedicamentoResponseDTO(Medicamento medicamento,
                                  List<MedicamentoHorario> horarios,
                                  List<RegistroTomada> registrosDia) {

        this.id = medicamento.getId();
        this.nome = medicamento.getMedicamentoAnvisa().getNomeProduto();
        this.tarja = medicamento.getTarja().name();


        this.contatarEmergencia = medicamento.getContatarEmergencia();

        // Usa dataFim que já é salvo no banco ao cadastrar/atualizar
        if (medicamento.getDataFim() != null) {
            long dias = ChronoUnit.DAYS.between(LocalDate.now(), medicamento.getDataFim());
            this.diasRestantes = (int) dias;
        } else {
            int calculado = medicamento.calcularDias();
            this.diasRestantes = calculado > 0 ? calculado : null;
        }

        this.horarios = horarios.stream().map(h -> {
            RegistroTomada registro = registrosDia.stream()
                    .filter(r -> r.getHorarioMedicamento().getId().equals(h.getId()))
                    .findFirst()
                    .orElse(null);

            return new MedicamentoHorarioDTO(h, registro);
        }).collect(Collectors.toList());
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getTarja() { return tarja; }


    public Boolean getContatarEmergencia() {
        return contatarEmergencia;
    }

    public List<MedicamentoHorarioDTO> getHorarios() { return horarios; }

    public Integer getDiasRestantes() { return diasRestantes; }
}
