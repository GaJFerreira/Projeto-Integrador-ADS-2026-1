package br.pucgo.ads.projetointegrador.dosecerta.database.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "contatos_emergencia", schema = "dose_certa")
public class ContatoEmergencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "telefone", nullable = false)
    private String telefone;

    @Column(name = "relacao")
    private String relacao;

    @Column(name = "usuario_id", nullable = false)
    private Long platformUserId;

    // ===== Getters & Setters
    public Long getId() { return id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getRelacao() { return relacao; }
    public void setRelacao(String relacao) { this.relacao = relacao; }

    public Long getPlatformUserId() { return platformUserId; }
    public void setPlatformUserId(Long platformUserId) { this.platformUserId = platformUserId; }
}
