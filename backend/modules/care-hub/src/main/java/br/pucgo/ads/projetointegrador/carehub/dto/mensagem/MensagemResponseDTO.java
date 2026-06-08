package br.pucgo.ads.projetointegrador.carehub.dto.mensagem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MensagemResponseDTO {
    private Long id;
    private Long remetenteId;
    private String remetenteNome;
    private String remetenteTipo;
    private Long destinatarioId;
    private String destinatarioNome;
    private String destinatarioTipo;
    private String conteudo;
    private OffsetDateTime dataEnvio;
    private Boolean lida;
    private String mediaUrl;
    private String mediaType;
    private Boolean enviadaPeloUsuarioLogado;
}
