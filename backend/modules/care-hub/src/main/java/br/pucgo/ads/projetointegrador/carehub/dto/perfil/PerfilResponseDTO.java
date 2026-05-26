package br.pucgo.ads.projetointegrador.carehub.dto.perfil;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerfilResponseDTO {

    // Dados básicos do Usuário
    private Long id;
    private Long platformUserId;
    private String username;
    private String email;
    private String name;
    private String role; // CAREHUB_CLIENTE ou CAREHUB_CUIDADOR
    private String phone; // telefone
    private Boolean ativo;
    private String status;

    // Se for Cliente
    private String endereco;
    private String necessidades;
    private String contatoEmergencia;
    private String tipoCliente;

    // Se for Cuidador
    private String experiencia;
    private String cidade;
    private String estado;
    private BigDecimal taxaHora;
    private BigDecimal avaliacaoMedia;
    private Integer totalAvaliacoes;
    private String biografia;
    private String fotoPerfil;
    private List<String> especialidades;
}
