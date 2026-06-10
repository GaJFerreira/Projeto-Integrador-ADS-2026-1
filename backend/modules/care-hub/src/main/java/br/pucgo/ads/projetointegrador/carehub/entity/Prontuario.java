package br.pucgo.ads.projetointegrador.carehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Prontuário médico/clínico do Cliente.
 */
@Entity
@Table(name = "ch_prontuario", schema = "care_hub")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prontuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "cliente_id", nullable = false, unique = true)
    private Cliente cliente;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(columnDefinition = "TEXT")
    private String historicoMedico;

    @Column(columnDefinition = "TEXT")
    private String medicamentosUso;

    @Column(columnDefinition = "TEXT")
    private String alergias;

    @Column(name = "contato_emergencia", length = 255)
    private String contatoEmergencia;

    @Column(columnDefinition = "TEXT")
    private String observacoesGerais;

    @Column(name = "tipo_sanguineo", length = 3)
    private String tipoSanguineo;

    @Column(name = "necessidades_especiais", columnDefinition = "TEXT")
    private String necessidadesEspeciais;

    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private OffsetDateTime dataCriacao;

    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private OffsetDateTime dataAtualizacao;
}
