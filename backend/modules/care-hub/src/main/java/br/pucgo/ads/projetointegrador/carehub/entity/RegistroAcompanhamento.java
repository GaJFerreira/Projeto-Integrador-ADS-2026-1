package br.pucgo.ads.projetointegrador.carehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

/**
 * Registro de acompanhamento clínico realizado pelo Cuidador durante um
 * atendimento.
 */
@Entity
@Table(name = "ch_registro_acompanhamento", schema = "care_hub")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroAcompanhamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "agendamento_id", nullable = false)
    private Agendamento agendamento;

    @ManyToOne
    @JoinColumn(name = "cuidador_id", nullable = false)
    private Cuidador cuidador;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(name = "data_hora_registro", nullable = false)
    private OffsetDateTime dataHoraRegistro;

    @Column(name = "pressao_arterial", length = 32)
    private String pressaoArterial;

    @Column(length = 32)
    private String glicemia;

    @Column(name = "medicamentos_administrados", columnDefinition = "TEXT")
    private String medicamentosAdministrados;

    @Column(columnDefinition = "TEXT")
    private String alimentacao;

    @Column(name = "atividades_realizadas", columnDefinition = "TEXT")
    private String atividadesRealizadas;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(columnDefinition = "TEXT")
    private String intercorrencias;

    @Column(name = "sinais_vitais", columnDefinition = "TEXT")
    private String sinaisVitais;

    @Column(name = "humor_estado", columnDefinition = "TEXT")
    private String humorEstado;

    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private OffsetDateTime dataCriacao;

    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private OffsetDateTime dataAtualizacao;

    @PrePersist
    protected void onCreate() {
        if (dataHoraRegistro == null) {
            dataHoraRegistro = OffsetDateTime.now(ZoneOffset.UTC);
        }
    }
}
