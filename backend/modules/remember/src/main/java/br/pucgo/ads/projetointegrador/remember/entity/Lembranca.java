package br.pucgo.ads.projetointegrador.remember.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lembranca", schema = "remember")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lembranca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long identificadorLembranca;

    @Column(name = "id_usuario", nullable = false)
    private Long identificadorUsuario;

    @Column(nullable = false)
    private String titulo;

    @Column(name = "data_acontecimento", nullable = false)
    private LocalDate dataAcontecimento;

    @Column(name = "pessoas_presentes", columnDefinition = "TEXT")
    private String pessoasPresentes;

    @Column()
    private String local;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String historia;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false,  insertable = false, updatable = false)
    private Usuario usuario;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }
}
