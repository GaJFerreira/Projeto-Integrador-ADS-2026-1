package br.pucgo.ads.projetointegrador.carehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "ch_cuidador", schema = "care_hub")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cuidador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "platform_user_id", unique = true)
    private Long platformUserId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(columnDefinition = "VARCHAR(255)")
    private String name;

    private String status;

    @Column(name = "role", length = 64)
    private String role;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "telefone")
    private String telefone;

    @Column(columnDefinition = "TEXT")
    private String experiencia;

    @ManyToMany
    @JoinTable(name = "ch_cuidador_especialidade", schema = "care_hub", joinColumns = @JoinColumn(name = "cuidador_id"), inverseJoinColumns = @JoinColumn(name = "especialidade_id"))
    private Set<Especialidade> especialidades = new HashSet<>();

    @Column(length = 128)
    private String cidade;

    @Column(length = 2)
    private String estado;

    @Column(nullable = true)
    private Boolean disponibilidade = true;

    @Column(name = "taxa_hora", precision = 10, scale = 2)
    private BigDecimal taxaHora;

    @Column(name = "avaliacao_media", precision = 3, scale = 2)
    private BigDecimal avaliacaoMedia = BigDecimal.ZERO;

    @Column
    private Integer totalAvaliacoes = 0;

    @Column(columnDefinition = "TEXT")
    private String biografia;

    @Column(length = 255)
    private String fotoPerfil;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        if (ativo == null) {
            ativo = true;
        }
        if (status == null) {
            status = "ACTIVE";
        }
    }
}