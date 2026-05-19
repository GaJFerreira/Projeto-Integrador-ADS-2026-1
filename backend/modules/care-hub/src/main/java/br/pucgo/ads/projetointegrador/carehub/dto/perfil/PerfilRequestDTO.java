package br.pucgo.ads.projetointegrador.carehub.dto.perfil;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerfilRequestDTO {

    // Campos Gerais/Comuns
    private String name;
    private String email;
    private String phone; // telefone

    // Campos específicos de Cliente
    private String endereco;
    private String necessidades;
    private String contatoEmergencia;
    private String tipoCliente;

    // Campos específicos de Cuidador
    private String experiencia;
    private String cidade;
    private String estado;
    private BigDecimal taxaHora;
    private String biografia;
    private String fotoPerfil;
    private List<String> especialidades;
}
