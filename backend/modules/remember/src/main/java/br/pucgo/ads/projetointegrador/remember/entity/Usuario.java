package br.pucgo.ads.projetointegrador.remember.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity(name = "UsuarioRemember")
@Table(name = "usuario", schema = "remember")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "platform_user_id", nullable = false, unique = true)
    private Long platformUserId;

    @Column(name = "nome")
    private String nome;

    @Column(name = "email")
    private String email;
}