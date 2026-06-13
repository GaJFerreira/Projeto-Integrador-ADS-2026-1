package br.pucgo.ads.projetointegrador.diario_saude.dto;

import java.time.LocalDate;

import br.pucgo.ads.projetointegrador.diario_saude.entity.UsuarioEntity;

public class UsuarioDTO {

    private Long id_usuario;
    private String nome;
    private int idade;
    private float peso;
    private float altura;
    private Long platformUserId;
    private LocalDate dataNascimento;

    public UsuarioDTO(UsuarioEntity usuario) {
        this.id_usuario = usuario.getId_usuario();
        this.nome = usuario.getNome();
        this.idade = usuario.getIdade();
        this.peso = usuario.getPeso();
        this.altura = usuario.getAltura();
        this.platformUserId = usuario.getPlatformUserId();
        this.dataNascimento = usuario.getDataNascimento();
    }

    public UsuarioDTO() {
    }

    public Long getId_usuario() {
        return id_usuario;
    }

    public void setId_usuario(long id_usuario) {
        this.id_usuario = id_usuario;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public int getIdade() {
        return idade;
    }

    public void setIdade(int idade) {
        this.idade = idade;
    }

    public float getPeso() {
        return peso;
    }

    public void setPeso(float peso) {
        this.peso = peso;
    }

    public float getAltura() {
        return altura;
    }

    public void setAltura(float altura) {
        this.altura = altura;
    }

    public Long getPlatformUserId() {
        return platformUserId;
    }

    public void setPlatformUserId(Long platformUserId) {
        this.platformUserId = platformUserId;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }
}
