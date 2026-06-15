package br.pucgo.ads.projetointegrador.dosecerta.dto;

import br.pucgo.ads.projetointegrador.dosecerta.database.entity.TarjaTipo;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class MedicamentoCreateDTO {

//    @NotNull
//    private Long platformUserId;

    private String tipoDosagem;          // "mg" ou "ml"
    private Integer doseDiaria;          // quantidade por dose
    private Integer quantidadeCartela;   // comprimidos
    private Double totalFrasco;          // ml

    private TarjaTipo tarja;             // PRETA / VERMELHA / AMARELA / SEM_TARJA

    // AGORA SUPORTA VÁRIOS CONTATOS
    private List<Long> contatosEmergenciaIds;

    private List<HorarioDTO> horarios;   // [{ "horario": "08:00" }]
    private String farmaciaPopular;

    // GETTERS / SETTERS


//    public Long getPlatformUserId() { return platformUserId; }
//    public void setPlatformUserId(Long platformUserId) { this.platformUserId = platformUserId; }

    public String getTipoDosagem() { return tipoDosagem; }
    public void setTipoDosagem(String tipoDosagem) { this.tipoDosagem = tipoDosagem; }

    public Integer getDoseDiaria() { return doseDiaria; }
    public void setDoseDiaria(Integer doseDiaria) { this.doseDiaria = doseDiaria; }

    public Integer getQuantidadeCartela() { return quantidadeCartela; }
    public void setQuantidadeCartela(Integer quantidadeCartela) { this.quantidadeCartela = quantidadeCartela; }

    public Double getTotalFrasco() { return totalFrasco; }
    public void setTotalFrasco(Double totalFrasco) { this.totalFrasco = totalFrasco; }

    public TarjaTipo getTarja() { return tarja; }
    public void setTarja(TarjaTipo tarja) { this.tarja = tarja; }

    public List<Long> getContatosEmergenciaIds() { return contatosEmergenciaIds; }
    public void setContatosEmergenciaIds(List<Long> contatosEmergenciaIds) {
        this.contatosEmergenciaIds = contatosEmergenciaIds; }

    public List<HorarioDTO> getHorarios() { return horarios; }
    public void setHorarios(List<HorarioDTO> horarios) { this.horarios = horarios; }

    public String getFarmaciaPopular() { return farmaciaPopular; }
    public void setFarmaciaPopular(String farmaciaPopular) { this.farmaciaPopular = farmaciaPopular; }
}
