package br.pucgo.ads.projetointegrador.eldencare.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "ex_participante", schema = "elden_care")
@Getter
@Setter
@NoArgsConstructor
public class ex_participante {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    // id do usuário autenticado na plataforma (referência fraca — não é FK)
    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false)
    private String nome;

    private LocalDate nascimento;

    private String sexo;

    @Column(name = "peso_kg")
    private Double pesoKg;

    @Column(name = "altura_cm")
    private Double alturaCm;

    private String observacoes;
}
