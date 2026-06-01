package br.pucgo.ads.projetointegrador.remember.dto.Pergunta;

import br.pucgo.ads.projetointegrador.remember.domain.StatusPergunta;
import br.pucgo.ads.projetointegrador.remember.entity.PerguntaCognitiva;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PerguntaCognitivaResponseDTO {

    private Long identificadorPerguntaCognitiva;
    private Long identificadorTemplateOrigem;
    private Long identificadorUsuario;
    private Long identificadorLembranca;
    private Long identificadorDiario;
    private String textoPergunta;
    private String status;
    private LocalDateTime dataGeracao;

    public PerguntaCognitivaResponseDTO(PerguntaCognitiva pergunta) {
        this.identificadorPerguntaCognitiva = pergunta.getIdentificadorPerguntaCognitiva();
        this.identificadorTemplateOrigem = pergunta.getIdentificadorTemplateOrigem();
        this.identificadorUsuario = pergunta.getIdentificadorUsuario();
        this.identificadorLembranca = pergunta.getIdentificadorLembranca();
        this.identificadorDiario = pergunta.getIdentificadorDiario();
        this.textoPergunta = pergunta.getTextoPergunta();
        this.dataGeracao = pergunta.getDataGeracao();

        if (pergunta.getStatus() != null) {
            this.status = StatusPergunta.of(pergunta.getStatus()).name();
        }
    }
}
