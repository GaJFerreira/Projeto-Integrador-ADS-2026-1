package br.pucgo.ads.projetointegrador.eldencare.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ex_plano", schema = "elden_care")
public class ex_plano {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participante_id", nullable = false)
    private ex_participante participante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id")
    private ex_resposta_questionario respostaQuestionario;

    @Column(name = "mes")
    private LocalDate mes;

    @Column(name = "objetivo")
    private String objetivo;

    @Column(name = "nivel")
    private String nivel;

    @Column(name = "freq_semana")
    private Integer freqSemana;

    @Column(name = "tempo_sessao_min")
    private Integer tempoSessaoMin;

    @OneToMany(mappedBy = "plano", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ex_dia_plano> dias = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ex_participante getParticipante() { return participante; }
    public void setParticipante(ex_participante participante) { this.participante = participante; }

    public ex_resposta_questionario getRespostaQuestionario() { return respostaQuestionario; }
    public void setRespostaQuestionario(ex_resposta_questionario r) { this.respostaQuestionario = r; }

    public LocalDate getMes() { return mes; }
    public void setMes(LocalDate mes) { this.mes = mes; }

    public String getObjetivo() { return objetivo; }
    public void setObjetivo(String objetivo) { this.objetivo = objetivo; }

    public String getNivel() { return nivel; }
    public void setNivel(String nivel) { this.nivel = nivel; }

    public Integer getFreqSemana() { return freqSemana; }
    public void setFreqSemana(Integer freqSemana) { this.freqSemana = freqSemana; }

    public Integer getTempoSessaoMin() { return tempoSessaoMin; }
    public void setTempoSessaoMin(Integer tempoSessaoMin) { this.tempoSessaoMin = tempoSessaoMin; }

    public List<ex_dia_plano> getDias() { return dias; }
    public void setDias(List<ex_dia_plano> dias) { this.dias = dias; }
}
