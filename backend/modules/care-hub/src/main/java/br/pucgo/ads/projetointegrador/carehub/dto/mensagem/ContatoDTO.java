package br.pucgo.ads.projetointegrador.carehub.dto.mensagem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContatoDTO {
    private Long id;
    private String nome;
    private String perfil; // "CLIENTE" ou "CUIDADOR"
    private String email;
    private Long mensagensNaoLidas; // Contador de mensagens nÃ£o lidas deste contato
    private String ultimaMensagem; // PrÃ©via da Ãºltima mensagem
    private OffsetDateTime dataUltimaMensagem; // Data/hora da Ãºltima mensagem
}

