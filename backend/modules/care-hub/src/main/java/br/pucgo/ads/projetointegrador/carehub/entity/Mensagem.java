package br.pucgo.ads.projetointegrador.carehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * Mensagem trocada entre dois usuÃ¡rios do CareHub.
 *
 * <p><strong>MudanÃ§a de arquitetura:</strong> os campos {@code remetente} e
 * {@code destinatario} eram anteriormente {@code User} (import da plataforma).
 * Agora sÃ£o representados apenas por seus IDs Long ({@code remetenteId} e
 * {@code destinatarioId}), eliminando qualquer dependÃªncia de classe externa.
 *
 * <p>O {@link br.pucgo.ads.projetointegrador.carehub.service.MensagemService}
 * resolve os nomes consultando repositÃ³rios locais (ex: CuidadorRepository, ClienteRepository)
 * quando necessÃ¡rio para montar o DTO de resposta.
 */
@Entity
@Table(name = "ch_mensagem", schema = "care_hub")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID do usuÃ¡rio remetente (referÃªncia a {@code care_hub.usuario.id}).
     * Sem FK explÃ­cita para permitir independÃªncia de schema.
     */
    @Column(name = "remetente_id", nullable = false)
    private Long remetenteId;

    /**
     * ID do usuÃ¡rio destinatÃ¡rio (referÃªncia a {@code care_hub.usuario.id}).
     */
    @Column(name = "destinatario_id", nullable = false)
    private Long destinatarioId;

    @Column(nullable = true, columnDefinition = "TEXT")
    private String conteudo;

    /** URL de mÃ­dia (Ã¡udio, imagem, etc.) */
    @Column(name = "media_url", length = 1024)
    private String mediaUrl;

    /** Tipo MIME da mÃ­dia (ex: "audio/webm", "image/jpeg") */
    @Column(name = "media_type", length = 128)
    private String mediaType;

    @CreationTimestamp
    @Column(name = "data_envio", nullable = false, updatable = false)
    private OffsetDateTime dataEnvio;

    @Column(nullable = false)
    private Boolean lida = false;
}

