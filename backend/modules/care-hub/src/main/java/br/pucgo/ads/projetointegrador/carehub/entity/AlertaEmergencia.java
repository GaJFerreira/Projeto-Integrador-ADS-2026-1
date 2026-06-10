package br.pucgo.ads.projetointegrador.carehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ch_alerta_emergencia", schema = "care_hub")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertaEmergencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    /**
     * Cuidador responsável pelo cliente no momento do alerta.
     * Nullable pois o cliente pode não ter cuidador vinculado via agendamento.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuidador_id", nullable = true)
    private Cuidador cuidador;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dispositivo_id", nullable = false)
    private DispositivoIoT dispositivo;

    @Column(nullable = false, length = 60)
    private String tipo;

    @Column(nullable = false, length = 40)
    private String status;

    @Column(nullable = false, length = 40)
    private String origem;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "reconhecido_em")
    private OffsetDateTime reconhecidoEm;
}

