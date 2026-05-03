package br.com.puc.saborfamilia.database.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
  name = "conversa",
  schema = "sabor_familia",
  uniqueConstraints = @UniqueConstraint(
    name = "uk_conversa_participantes",
    columnNames = {"primeiro_participante", "segundo_participante"}
  )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversaEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "primeiro_participante", nullable = false)
  private PerfilEntity primeiroParticipante;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "segundo_participante", nullable = false)
  private PerfilEntity segundoParticipante;

  @Column(name = "data_envio_ultima_mensagem")
  private LocalDateTime dataEnvioUltimaMensagem;

  @Column(name = "conteudo_ultima_mensagem")
  private String conteudoUltimaMensagem;

  public PerfilEntity getOutroParticipante(Long perfilId) {
    if (primeiroParticipante.getId().equals(perfilId)) {
      return segundoParticipante;
    }
    return primeiroParticipante;
  }
}
