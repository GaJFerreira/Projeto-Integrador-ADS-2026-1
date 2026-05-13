package br.pucgo.ads.projetointegrador.diario_saude.dto;

public class RespostaQuestionarioDTO {

    private Long perguntaId;
    private String perguntaTexto;
    private String resposta;
    private int peso;

    public RespostaQuestionarioDTO(Long perguntaId, String perguntaTexto, String resposta, int peso) {
        this.perguntaId = perguntaId;
        this.perguntaTexto = perguntaTexto;
        this.resposta = resposta;
        this.peso = peso;
    }

    public Long getPerguntaId() { return perguntaId; }
    public String getPerguntaTexto() { return perguntaTexto; }
    public String getResposta() { return resposta; }
    public int getPeso() { return peso; }
}
