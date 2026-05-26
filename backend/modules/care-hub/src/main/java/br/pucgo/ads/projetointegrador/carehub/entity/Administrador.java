package br.pucgo.ads.projetointegrador.carehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

/**
 * Perfil de Administrador do módulo CareHub.
 */
@Entity
@Table(name = "ch_administrador", schema = "care_hub")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Administrador {

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

    /** Departamento de responsabilidade do administrador */
    @Column(length = 128)
    private String departamento;

    /** Nível de acesso dentro do módulo (ex: GESTOR, SUPERVISOR) */
    @Column(name = "nivel_acesso", length = 64)
    private String nivelAcesso;

    /** Indica se possui privilégios de super-administrador */
    @Column(name = "super_admin", nullable = false, columnDefinition = "boolean default false")
    private boolean superAdmin = false;

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