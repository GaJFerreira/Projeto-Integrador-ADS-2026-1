package br.pucgo.ads.projetointegrador.remember.dto.Pergunta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RespostaPerguntaUsuarioRequestDTO {

    @NotNull(message = "O identificador da pergunta e obrigatorio.")
    private Long identificadorPergunta;

    private Long identificadorUsuario;

    @NotBlank(message = "O texto da resposta nao pode estar em branco.")
    private String textoResposta;
}
