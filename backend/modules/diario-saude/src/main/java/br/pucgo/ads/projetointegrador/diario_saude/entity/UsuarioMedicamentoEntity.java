package br.pucgo.ads.projetointegrador.diario_saude.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "ds_usuario_medicamento", schema = "diario_saude")
public class UsuarioMedicamentoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_usuario_medicamento;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnore
    private UsuarioEntity usuario;

    @Column(nullable = false)
    private String nome_medicamento;

    @Column
    private String principio_ativo;

    @Column(nullable = false)
    private String concentracao;

    @Column(nullable = false)
    private String via;

    @Column(nullable = false)
    private String dosagem;

    @Column(nullable = false)
    private String frequencia;

    public UsuarioMedicamentoEntity() {}

    public UsuarioMedicamentoEntity(UsuarioEntity usuario, String nome_medicamento,
            String principio_ativo, String concentracao, String via,
            String dosagem, String frequencia) {
        this.usuario = usuario;
        this.nome_medicamento = nome_medicamento;
        this.principio_ativo = principio_ativo;
        this.concentracao = concentracao;
        this.via = via;
        this.dosagem = dosagem;
        this.frequencia = frequencia;
    }

    public Long getId_usuario_medicamento() { return id_usuario_medicamento; }
    public UsuarioEntity getUsuario() { return usuario; }
    public String getNome_medicamento() { return nome_medicamento; }
    public String getPrincipio_ativo() { return principio_ativo; }
    public String getConcentracao() { return concentracao; }
    public String getVia() { return via; }
    public String getDosagem() { return dosagem; }
    public String getFrequencia() { return frequencia; }

    public void setUsuario(UsuarioEntity usuario) { this.usuario = usuario; }
    public void setNome_medicamento(String nome_medicamento) { this.nome_medicamento = nome_medicamento; }
    public void setPrincipio_ativo(String principio_ativo) { this.principio_ativo = principio_ativo; }
    public void setConcentracao(String concentracao) { this.concentracao = concentracao; }
    public void setVia(String via) { this.via = via; }
    public void setDosagem(String dosagem) { this.dosagem = dosagem; }
    public void setFrequencia(String frequencia) { this.frequencia = frequencia; }
}
