package br.com.puc.saborfamilia.enums;

import java.util.Locale;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum FormatoMidiaEnum {

  JPEG("image/jpeg", ".jpg", "jpg", 0.85f),
  PNG("image/png", ".png", "png", null);

  private final String contentType;
  private final String extensao;
  private final String formatoImagem;
  private final Float qualidadeCompressao;

  public static FormatoMidiaEnum fromContentType(String contentType) {
    if (contentType == null || contentType.isBlank()) {
      throw new IllegalArgumentException("Content-Type da imagem não informado.");
    }

    String normalizado = contentType.toLowerCase(Locale.ROOT).trim();

    if ("image/jpg".equals(normalizado)) {
      normalizado = JPEG.contentType;
    }

    return switch (normalizado) {
      case "image/jpeg" -> JPEG;
      case "image/png" -> PNG;
      default -> throw new IllegalArgumentException("Formato não suportado: " + contentType);
    };
  }

}
