package br.com.puc.saborfamilia.service.seguindo.dto;

public record SeguindoResponse(
  Long perfilId,
  boolean seguindo,
  String motivo
) {
}
