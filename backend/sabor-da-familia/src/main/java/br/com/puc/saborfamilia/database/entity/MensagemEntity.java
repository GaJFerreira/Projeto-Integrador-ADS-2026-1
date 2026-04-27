package br.com.puc.saborfamilia.database.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Index;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
  name = "mensagem",
  indexes = {
    @Index(name = "idx_mensagem_conversa_id", columnList = "conversa_id"),
    @Index(name = "idx_mensagem_remetente_id", columnList = "remetente_id"),
    @Index(name = "idx_mensagem_destinatario_id", columnList = "destinatario_id")
  }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MensagemEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "remetente_id", nullable = false)
  private PerfilEntity remetente;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "destinatario_id", nullable = false)
  private PerfilEntity destinatario;

  @JsonIgnore
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "conversa_id", nullable = false)
  private ConversaEntity conversa;

  @Column(name = "texto", columnDefinition = "TEXT", nullable = false)
  private String texto;

  @Column(name = "data_envio", nullable = false)
  private LocalDateTime dataEnvio;

}
