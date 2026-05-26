package br.pucgo.ads.projetointegrador.carehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * MÃ­dia associada a uma {@link Mensagem} (Ã¡udio, imagem, documento).
 */
@Entity
@Table(name = "message_media", schema = "care_hub")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mensagem_id", nullable = false)
    private Long mensagemId;

    @Column(name = "storage_key", nullable = false)
    private String storageKey;

    @Column(name = "media_url", nullable = false)
    private String mediaUrl;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Lob
    @Column(name = "data")
    private byte[] data;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}

