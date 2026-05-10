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
 * Entidade local de usuário do módulo CareHub.
 *
 * <p><strong>Regra arquitetural:</strong> Esta classe é 100% autônoma — não herda nem importa
 * nenhuma classe da plataforma. A referência ao usuário autenticado da plataforma
 * é mantida apenas como {@code platformUserId} (Long), nunca como objeto.
 *
 * <p>Quando um usuário da plataforma cria um perfil de Cuidador ou Cliente,
 * o service espelha seus dados básicos (username, email, name) nesta tabela
 * e armazena o ID da plataforma em {@code platformUserId}.
 */
@Entity
@Table(name = "usuario", schema = "care_hub")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID do usuário autenticado na plataforma (plataforma.users.id).
     * Referência opaca — sem import de classe externa.
     */
    @Column(name = "platform_user_id", unique = true)
    private Long platformUserId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String password;

    private String name;

    private String phone;

    private String status;

    /**
     * Role dentro do módulo CareHub (ex: "CAREHUB_CUIDADOR", "CAREHUB_CLIENTE", "CAREHUB_ADMIN").
     * Representada como String simples para evitar dependência de enum externo.
     */
    @Column(name = "role", length = 64)
    private String role;

    // ── Campos de compatibilidade legada ─────────────────────────────────────

    /** Indica se o usuário está ativo no sistema. Derivado de status/deletedAt. */
    @Column(nullable = false)
    private Boolean ativo = true;

    /**
     * Data/hora de criação no formato legado LocalDateTime.
     * Mantido para compatibilidade com código legado do CareHub.
     */
    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    // ── Campos de auditoria ───────────────────────────────────────────────────

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    // ── @PrePersist para defaults ─────────────────────────────────────────────

    @PrePersist
    protected void onCreate() {
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }
        if (ativo == null) {
            ativo = true;
        }
        if (status == null) {
            status = "ACTIVE";
        }
    }
}
