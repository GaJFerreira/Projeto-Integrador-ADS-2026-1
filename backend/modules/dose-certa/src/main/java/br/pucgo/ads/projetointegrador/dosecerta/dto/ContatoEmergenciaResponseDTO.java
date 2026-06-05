package br.pucgo.ads.projetointegrador.dosecerta.dto;

import br.pucgo.ads.projetointegrador.dosecerta.database.entity.ContatoEmergencia;

public class ContatoEmergenciaResponseDTO {

    private Long id;
    private String nome;
    private String telefone;
    private String relacao;

    public ContatoEmergenciaResponseDTO(ContatoEmergencia contato) {
        this.id = contato.getId();
        this.nome = contato.getNome();
        this.telefone = contato.getTelefone();
        this.relacao = contato.getRelacao();
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getRelacao() {
        return relacao;
    }
}
