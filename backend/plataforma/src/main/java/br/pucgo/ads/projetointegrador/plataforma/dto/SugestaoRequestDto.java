package br.pucgo.ads.projetointegrador.plataforma.dto;

import br.pucgo.ads.projetointegrador.plataforma.entity.Sugestao.TipoSugestao;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SugestaoRequestDto {

    private TipoSugestao tipo;
    private String assunto;
    private String mensagem;
}
