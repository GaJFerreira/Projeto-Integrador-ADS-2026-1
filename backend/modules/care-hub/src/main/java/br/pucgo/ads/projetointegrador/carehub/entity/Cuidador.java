package br.pucgo.ads.projetointegrador.carehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@DiscriminatorValue("CUIDADOR")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Cuidador extends Usuario {

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

<<<<<<< HEAD
    @Column(nullable = true)
=======
    @Column(nullable = false)
>>>>>>> 0df5844ce5e6a1355fa6246b7cd7a2c1656ea2ea
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
}