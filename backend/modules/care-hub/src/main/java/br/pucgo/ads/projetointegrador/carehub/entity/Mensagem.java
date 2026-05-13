package br.pucgo.ads.projetointegrador.carehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Mensagem trocada entre dois usuários do CareHub.
 *
 * <p><strong>Mudança de arquitetura:</strong> os campos {@code remetente} e
 * {@code destinatario} eram anteriormente {@code User} (import da plataforma).
 * Agora são representados apenas por seus IDs Long ({@code remetenteId} e
 * {@code destinatarioId}), eliminando qualquer dependência de classe externa.
 *
 * <p>O {@link br.pucgo.ads.projetointegrador.carehub.service.MensagemService}
 * resolve os nomes consultando o {@code UsuarioRepository} local quando necessário
 * para montar o DTO de resposta.
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
     * ID do usuário remetente (referência a {@code care_hub.usuario.id}).
     * Sem FK explícita para permitir independência de schema.
     */
    @Column(name = "remetente_id", nullable = false)
    private Long remetenteId;

    /**
     * ID do usuário destinatário (referência a {@code care_hub.usuario.id}).
     */
    @Column(name = "destinatario_id", nullable = false)
    private Long destinatarioId;

    @Column(nullable = true, columnDefinition = "TEXT")
    private String conteudo;

    /** URL de mídia (áudio, imagem, etc.) */
    @Column(name = "media_url", length = 1024)
    private String mediaUrl;

    /** Tipo MIME da mídia (ex: "audio/webm", "image/jpeg") */
    @Column(name = "media_type", length = 128)
    private String mediaType;

    @CreationTimestamp
    @Column(name = "data_envio", nullable = false, updatable = false)
    private LocalDateTime dataEnvio;

    @Column(nullable = false)
    private Boolean lida = false;
}
