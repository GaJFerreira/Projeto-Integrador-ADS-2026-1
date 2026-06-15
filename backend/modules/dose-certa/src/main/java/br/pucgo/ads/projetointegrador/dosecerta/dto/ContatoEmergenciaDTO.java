package br.pucgo.ads.projetointegrador.dosecerta.dto;

public class ContatoEmergenciaDTO {

    private Long platformUserId;
    private String nome;
    private String telefone;
    private String relacao;

    public Long getPlatformUserId() { return platformUserId; }

    public void setPlatformUserId(Long platformUserId) { this.platformUserId = platformUserId; }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getRelacao() {
        return relacao;
    }

    public void setRelacao(String relacao) {
        this.relacao = relacao;
    }
}
