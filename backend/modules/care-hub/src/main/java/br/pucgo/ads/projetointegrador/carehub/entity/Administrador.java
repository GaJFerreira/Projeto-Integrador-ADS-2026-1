package br.pucgo.ads.projetointegrador.carehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Perfil de Administrador do módulo CareHub.
 *
 * <p>
 * Estende {@link Usuario} local — sem nenhuma dependência da plataforma.
 */
@Entity
@Table(name = "ch_administrador", schema = "care_hub")
@PrimaryKeyJoinColumn(name = "id")
@DiscriminatorValue("ADMINISTRADOR")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Administrador extends Usuario {

    /** Departamento de responsabilidade do administrador */
    @Column(length = 128)
    private String departamento;

    /** Nível de acesso dentro do módulo (ex: GESTOR, SUPERVISOR) */
    @Column(name = "nivel_acesso", length = 64)
    private String nivelAcesso;

    /** Indica se possui privilégios de super-administrador */
    @Column(name = "super_admin", nullable = false, columnDefinition = "boolean default false")
    private boolean superAdmin = false;
}