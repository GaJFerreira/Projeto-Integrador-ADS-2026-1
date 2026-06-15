package br.pucgo.ads.projetointegrador.plataforma.dto;

import br.pucgo.ads.projetointegrador.plataforma.entity.Sugestao.TipoSugestao;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SugestaoResponseDto {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private TipoSugestao tipo;
    private String assunto;
    private String mensagem;
    private Boolean lida;
    private OffsetDateTime createdAt;
}
