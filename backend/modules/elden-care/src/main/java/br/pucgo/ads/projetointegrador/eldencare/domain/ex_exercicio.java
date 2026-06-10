package br.pucgo.ads.projetointegrador.eldencare.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "ex_exercicio", schema = "elden_care")
@Getter
@Setter
@NoArgsConstructor
public class ex_exercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private String nome;

    // JSONB — ex.: {"grupo":"membros_inferiores","tipo":"aerobico"}
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags_json", columnDefinition = "jsonb")
    private Map<String, Object> tagsJson;

    @Column(name = "tempo_medio_min")
    private Integer tempoMedioMin;
}
