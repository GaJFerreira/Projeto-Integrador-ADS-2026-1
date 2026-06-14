package br.pucgo.ads.projetointegrador.diario_saude.dto;

import java.time.LocalDate;
import br.pucgo.ads.projetointegrador.diario_saude.entity.PrescricaoExameEntity;

public class PrescricaoExameDTO {

    private long id_prescricao_exame;
    private long id_exame;
    private long id_prescricao_medica;

    private String nome_exame;

    private LocalDate data_prescricao;
    private String observacao;

    // Campos que estavam faltando — necessários para distinguir pendente/analisado
    private String resultado;
    private LocalDate data_realizacao;

    public PrescricaoExameDTO(PrescricaoExameEntity entity) {
        this.id_prescricao_exame = entity.getId_prescricao_exame();
        this.data_prescricao = entity.getData_prescricao();
        this.observacao = entity.getObservacao();

        // Campos adicionados
        this.resultado = entity.getResultado();
        this.data_realizacao = entity.getData_realizacao();

        if (entity.getExame() != null) {
            this.id_exame = entity.getExame().getId_exame();
            this.nome_exame = entity.getExame().getNome_exame();
        } else {
            this.nome_exame = "Exame Desconhecido (Falha de Mapeamento)";
        }
    }

    public PrescricaoExameDTO() {
    }

    public long getId_prescricao_exame() {
        return id_prescricao_exame;
    }

    public void setId_prescricao_exame(long id_prescricao_exame) {
        this.id_prescricao_exame = id_prescricao_exame;
    }

    public long getId_exame() {
        return id_exame;
    }

    public void setId_exame(long id_exame) {
        this.id_exame = id_exame;
    }

    public long getId_prescricao_medica() {
        return id_prescricao_medica;
    }

    public void setId_prescricao_medica(long id_prescricao_medica) {
        this.id_prescricao_medica = id_prescricao_medica;
    }

    public String getNome_exame() {
        return nome_exame;
    }

    public void setNome_exame(String nome_exame) {
        this.nome_exame = nome_exame;
    }

    public LocalDate getData_prescricao() {
        return data_prescricao;
    }

    public void setData_prescricao(LocalDate data_prescricao) {
        this.data_prescricao = data_prescricao;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    public LocalDate getData_realizacao() {
        return data_realizacao;
    }

    public void setData_realizacao(LocalDate data_realizacao) {
        this.data_realizacao = data_realizacao;
    }
}