package br.pucgo.ads.projetointegrador.plataforma.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class UserProfileDto {

    private String name;
    private String email;
    private String username;
    private String password;

    private Long roleId;

    private String crm;
    private String certificacao;
    private String experiencia;

    private String phone;
    private LocalDate birthDate;
    private String photoUrl;

    // IDs das permissões individuais a serem atribuídas ao usuário
    private List<Long> permissionIds;
}
