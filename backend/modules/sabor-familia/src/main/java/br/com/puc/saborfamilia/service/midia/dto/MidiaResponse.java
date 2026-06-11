package br.com.puc.saborfamilia.service.midia.dto;

public record MidiaResponse(
  byte[] dados,
  String contentType
) {
}
