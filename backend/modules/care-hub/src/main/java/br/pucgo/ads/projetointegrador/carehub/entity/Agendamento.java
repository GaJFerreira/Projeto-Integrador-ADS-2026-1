package br.pucgo.ads.projetointegrador.carehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

/**
 * Entidade de Agendamento de atendimento entre Cuidador e Cliente.
 */
@Entity
@Table(name = "ch_agendamento", schema = "care_hub")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cuidador_id", nullable = false)
    private Cuidador cuidador;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(name = "data_hora_inicio", nullable = false)
    private OffsetDateTime dataHoraInicio;

    @Column(name = "data_hora_fim", nullable = false)
    private OffsetDateTime dataHoraFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private StatusAgendamento status;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_atendimento", length = 32)
    private TipoAtendimento tipoAtendimento;

    @Column(name = "data_solicitacao")
    private OffsetDateTime dataSolicitacao;

    /** Data/hora de iní­cio proposta pelo cuidador (contraproposta) */
    @Column(name = "proposed_data_hora_inicio")
    private OffsetDateTime proposedDataHoraInicio;

    /** Data/hora de fim proposta pelo cuidador (contraproposta) */
    @Column(name = "proposed_data_hora_fim")
    private OffsetDateTime proposedDataHoraFim;

    // Enum de status
    public enum StatusAgendamento {
        PENDENTE,
        CONFIRMADO,
        REAGENDADO,
        EM_ANDAMENTO,
        CONCLUIDO,
        CANCELADO
    }

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        if (dataSolicitacao == null) {
            dataSolicitacao = OffsetDateTime.now(ZoneOffset.UTC);
        }
        if (status == null) {
            status = StatusAgendamento.PENDENTE;
        }
    }
}
