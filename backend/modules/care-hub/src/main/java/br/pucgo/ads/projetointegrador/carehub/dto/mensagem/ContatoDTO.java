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
    private Long mensagensNaoLidas; // Contador de mensagens não lidas deste contato
    private String ultimaMensagem; // Prévia da última mensagem
    private OffsetDateTime dataUltimaMensagem; // Data/hora da última mensagem
    private Long ultimoRemetenteId; // ID do remetente local da última mensagem
    // true se a última mensagem foi enviada pelo usuário autenticado (calculado no backend
    // com IDs locais — sem risco de mismatch platformId/localId no frontend)
    private Boolean ultimaMensagemEnviadaPorMim;
}
