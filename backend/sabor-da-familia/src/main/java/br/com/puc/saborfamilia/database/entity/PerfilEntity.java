package br.com.puc.saborfamilia.database.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "perfil")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerfilEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "usuario_id", nullable = false)
  private Long usuarioId;

  @Column(name = "nome", nullable = false)
  private String nome;

  @Column(name = "email", nullable = false, unique = true)
  private String email;

  @Column(name = "bio")
  private String bio;

  @Column(name = "data_nascimento", nullable = false)
  private LocalDate dataNascimento;

  @Column(name = "foto_perfil_url")
  private String fotoPerfilUrl;

  @OneToMany(mappedBy = "perfil")
  @Builder.Default
  private List<ReceitaEntity> receitas = new ArrayList<>();

  @OneToMany(mappedBy = "perfil")
  @Builder.Default
  private List<PerfilRestricaoAlimentarEntity> restricoesAlimentares = new ArrayList<>();

  @OneToMany(mappedBy = "perfil")
  @Builder.Default
  private List<PersonalizacaoPerfilEntity> personalizacoes = new ArrayList<>();

  @Column(name = "data_cadastro", nullable = false)
  private LocalDateTime dataCadastro;

  @Column(name = "ultima_atualizacao", nullable = false)
  private LocalDateTime ultimaAtualizacao;

}

