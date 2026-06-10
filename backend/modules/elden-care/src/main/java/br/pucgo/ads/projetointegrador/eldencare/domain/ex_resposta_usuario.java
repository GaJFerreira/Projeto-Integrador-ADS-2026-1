package br.pucgo.ads.projetointegrador.eldencare.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "ex_resposta_usuario", schema = "elden_care")
@Getter
@Setter
@NoArgsConstructor
public class ex_resposta_usuario {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "response_id")
    private ex_resposta_questionario respostaQuestionario;

    // chave textual da pergunta (ex: "cansaco_ativ_leves")
    @Column(name = "pergunta_chave")
    private String perguntaChave;

    // FK para ex_pergunta — opcional; preenchida quando a pergunta está cadastrada no banco
    @ManyToOne(optional = true)
    @JoinColumn(name = "question_id")
    private ex_pergunta pergunta;

    // valor textual da resposta (ex: "frequente", "sim")
    @Column(name = "option_code")
    private String optionCode;

    // valor numérico quando aplicável
    @Column(name = "value_number")
    private Double valueNumber;

    // valor booleano quando aplicável
    @Column(name = "value_boolean")
    private Boolean valueBoolean;
}
