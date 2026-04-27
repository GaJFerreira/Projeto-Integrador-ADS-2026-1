package br.com.puc.saborfamilia.service.perfil.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record PerfilRequest(

  @NotBlank(message = "O nome do perfil deve ser preenchido.")
  @Schema(description = "Nome de perfil do usuário.", example = "Mariana Souza")
  String nome,

  @NotBlank(message = "O email do perfil deve ser preenchido.")
  @Schema(description = "E-mail de perfil do usuário.", example = "mariana.souza@email.com")
  String email,

  @NotNull(message = "A data de nascimento deve ser preenchida.")
  @JsonFormat(pattern = "dd/MM/yyyy", shape = JsonFormat.Shape.STRING)
  @Schema(description = "Data de nascimento do usuário.", example = "12/12/1990")
  LocalDate dataNascimento,

  @Schema(description = "Biografia de perfil do usuário.", example = "Adoro cozinhar ouvindo músicas.")
  String bio,

  @NotBlank(message = "A URL de foto do perfil deve ser preenchida.")
  @Schema(description = "URL do caminho da foto de perfil.", example = "https://www.exemplo.com.br")
  String fotoPerfilUrl,

  @Schema(description = "Códigos ativos do catálogo (GET /restricao-alimentar).", example = "[\"SOJA\", \"ACUCAR\"]")
  List<String> restricoesAlimentares,

  @Schema(description = "Códigos das personalizações de perfil.", example = "[\"INGREDIENTES_COMUNS\", \"TRADICIONAL\"]")
  List<String> personalizacoes

) {

}
