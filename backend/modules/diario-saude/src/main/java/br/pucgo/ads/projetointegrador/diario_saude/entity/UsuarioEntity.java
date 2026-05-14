package br.pucgo.ads.projetointegrador.diario_saude.entity;

import org.springframework.beans.BeanUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;
import br.pucgo.ads.projetointegrador.diario_saude.dto.UsuarioDTO;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "usuario_info_clinica", schema = "diario_saude")
public class UsuarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private int idade;

    @Column(nullable = false)
    private float peso;

    @Column(nullable = false)
    private float altura;

    @Column(name = "platform_user_id")
    private Long platformUserId;

    @OneToMany(mappedBy = "usuario")
    @JsonIgnore
    private List<PrescricaoMedicaEntity> prescricoesMedicas;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<UsuarioDoencasEntity> usuarioDoencas;

    public UsuarioEntity(UsuarioDTO usuario) {
        BeanUtils.copyProperties(usuario, this);
    }

    public UsuarioEntity() {
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + (int) (idUsuario ^ (idUsuario >>> 32));
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        UsuarioEntity other = (UsuarioEntity) obj;
        return idUsuario == other.idUsuario;
    }

    public Long getId_usuario() {
        return idUsuario;
    }

    public void setId_usuario(long id_usuario) {
        this.idUsuario = id_usuario;
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

    public List<PrescricaoMedicaEntity> getPrescricoesMedicas() {
        return prescricoesMedicas;
    }

    public void setPrescricoesMedicas(List<PrescricaoMedicaEntity> prescricoesMedicas) {
        this.prescricoesMedicas = prescricoesMedicas;
    }

    public List<UsuarioDoencasEntity> getUsuarioDoencas() {
        return usuarioDoencas;
    }

    public void setUsuarioDoencas(List<UsuarioDoencasEntity> usuarioDoencas) {
        this.usuarioDoencas = usuarioDoencas;
    }
}
