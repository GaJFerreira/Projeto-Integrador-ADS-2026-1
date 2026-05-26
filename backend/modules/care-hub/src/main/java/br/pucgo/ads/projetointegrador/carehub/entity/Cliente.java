package br.pucgo.ads.projetointegrador.carehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ch_cliente", schema = "care_hub")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

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

    @Column(name = "telefone")
    private String telefone;

    private String status;

    @Column(name = "role", length = 64)
    private String role;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(columnDefinition = "TEXT")
    private String necessidades;

    @Column(length = 255)
    private String endereco;

    @Column(name = "contato_emergencia", length = 255)
    private String contatoEmergencia;

    @Column(name = "tipo_cliente", length = 64)
    private String tipoCliente;

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