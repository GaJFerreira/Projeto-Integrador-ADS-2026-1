package br.pucgo.ads.projetointegrador.eldencare.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "ex_opcao_pergunta",
    schema = "elden_care",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_opcao_pergunta_pergunta_codigo", columnNames = {"pergunta_id", "codigo"})
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ex_opcao_pergunta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "pergunta_id", nullable = false)
    private ex_pergunta pergunta;

    @Column(nullable = false)
    private String codigo; // ex.: "A", "sim", "nunca"

    @Column(nullable = false)
    private String rotulo; // ex.: "Nunca", "Às vezes"

    // posição de exibição dentro da pergunta
    @Column
    private Integer ordem;

    @Builder.Default
    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
