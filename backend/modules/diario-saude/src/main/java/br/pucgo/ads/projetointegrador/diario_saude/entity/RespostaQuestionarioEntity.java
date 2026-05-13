package br.pucgo.ads.projetointegrador.diario_saude.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ds_resposta_questionario", schema = "diario_saude",
       uniqueConstraints = @UniqueConstraint(columnNames = {"platform_user_id", "pergunta_id"}))
public class RespostaQuestionarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "platform_user_id", nullable = false)
    private Long platformUserId;

    @ManyToOne
    @JoinColumn(name = "pergunta_id", nullable = false)
    private PerguntaEntity pergunta;

    @Column(nullable = false)
    private String resposta;

    @Column(nullable = false)
    private int peso;

    public RespostaQuestionarioEntity() {
    }

    public RespostaQuestionarioEntity(Long platformUserId, PerguntaEntity pergunta, String resposta, int peso) {
        this.platformUserId = platformUserId;
        this.pergunta = pergunta;
        this.resposta = resposta;
        this.peso = peso;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPlatformUserId() { return platformUserId; }
    public void setPlatformUserId(Long platformUserId) { this.platformUserId = platformUserId; }

    public PerguntaEntity getPergunta() { return pergunta; }
    public void setPergunta(PerguntaEntity pergunta) { this.pergunta = pergunta; }

    public String getResposta() { return resposta; }
    public void setResposta(String resposta) { this.resposta = resposta; }

    public int getPeso() { return peso; }
    public void setPeso(int peso) { this.peso = peso; }
}
