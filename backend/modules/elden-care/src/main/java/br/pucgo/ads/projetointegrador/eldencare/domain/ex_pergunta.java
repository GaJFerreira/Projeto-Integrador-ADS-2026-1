package br.pucgo.ads.projetointegrador.eldencare.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "ex_pergunta", schema = "elden_care")
@Getter
@Setter
@NoArgsConstructor
public class ex_pergunta {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    private Integer ordem;

    @Column(nullable = false)
    private String enunciado;

    private String tipo; // ex: "opcao", "texto", "numero"

    // chave textual única usada nas respostas (ex: "cansaco_ativ_leves")
    @Column(unique = true)
    private String slug;

    // categoria a que pertence (ex: "condicao", "cardio")
    @Column
    private String categoria;
}
