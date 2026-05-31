package br.com.puc.saborfamilia.utils;

import br.com.puc.saborfamilia.enums.FormatoMidiaEnum;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Iterator;
import java.util.Locale;
import java.util.Set;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public final class MidiaUtils {

  public static final String MENSAGEM_LARGURA_UPLOAD_EXCEDIDA = "A largura da imagem excede o máximo permitido no upload.";

  private static final Set<String> CONTENT_TYPES = Set.of(
    FormatoMidiaEnum.JPEG.getContentType(),
    FormatoMidiaEnum.PNG.getContentType(),
    "image/jpg"
  );

  public static boolean validarContentType(String contentType) {
    if (contentType == null) {
      return false;
    }

    String normalizado = contentType.toLowerCase(Locale.ROOT).trim();

    return CONTENT_TYPES.contains(normalizado);
  }

  public static FormatoMidiaEnum ajustarFormato(String contentType) throws IOException {
    try {
      return FormatoMidiaEnum.fromContentType(contentType);
    }
    catch (IllegalArgumentException e) {
      throw new IOException(e.getMessage(), e);
    }
  }

  public static byte[] codificarMidiaOriginal(InputStream entrada, int larguraMaximaUpload, FormatoMidiaEnum formato)
    throws IOException {
    BufferedImage original = ImageIO.read(entrada);

    if (original == null) {
      throw new IOException("Arquivo de imagem inválido ou formato não suportado.");
    }

    if (original.getWidth() > larguraMaximaUpload) {
      throw new IOException(MENSAGEM_LARGURA_UPLOAD_EXCEDIDA);
    }

    return codificar(copiarParaTipo(original, tipoBuffer(formato)), formato);
  }

  public static byte[] redimensionarMidia(byte[] imagemOriginal, int larguraMaximaPx, FormatoMidiaEnum formato)
    throws IOException {
    BufferedImage original = ImageIO.read(new java.io.ByteArrayInputStream(imagemOriginal));

    if (original == null) {
      throw new IOException("Arquivo de imagem inválido ou formato não suportado.");
    }

    BufferedImage escalada = escalarMidia(original, larguraMaximaPx, formato);

    return codificar(escalada, formato);
  }

  private static BufferedImage escalarMidia(BufferedImage original, int larguraMaximaPx, FormatoMidiaEnum formato) {
    int largura = original.getWidth();
    int altura = original.getHeight();

    if (largura <= larguraMaximaPx) {
      return copiarParaTipo(original, tipoBuffer(formato));
    }

    int novaAltura = (int) Math.round((double) altura * larguraMaximaPx / largura);
    Image imagemAjustada = original.getScaledInstance(larguraMaximaPx, novaAltura, Image.SCALE_SMOOTH);
    BufferedImage resultado = new BufferedImage(larguraMaximaPx, novaAltura, tipoBuffer(formato));

    Graphics2D graphics = resultado.createGraphics();
    graphics.drawImage(imagemAjustada, 0, 0, null);
    graphics.dispose();

    return resultado;
  }

  private static int tipoBuffer(FormatoMidiaEnum formato) {
    return formato == FormatoMidiaEnum.JPEG ? BufferedImage.TYPE_INT_RGB : BufferedImage.TYPE_INT_ARGB;
  }

  private static BufferedImage copiarParaTipo(BufferedImage original, int tipo) {
    if (original.getType() == tipo) {
      return original;
    }

    BufferedImage copia = new BufferedImage(original.getWidth(), original.getHeight(), tipo);
    Graphics2D graphics = copia.createGraphics();
    graphics.drawImage(original, 0, 0, null);
    graphics.dispose();

    return copia;
  }

  private static byte[] codificar(BufferedImage imagem, FormatoMidiaEnum formato) throws IOException {
    if (formato == FormatoMidiaEnum.JPEG) {
      return codificarJpeg(imagem, formato.getQualidadeCompressao());
    }

    try (ByteArrayOutputStream saida = new ByteArrayOutputStream()) {
      if (!ImageIO.write(imagem, formato.getFormatoImagem(), saida)) {
        throw new IOException("Não foi possível converter a imagem para PNG.");
      }

      return saida.toByteArray();
    }
  }

  private static byte[] codificarJpeg(BufferedImage imagem, float qualidade) throws IOException {
    BufferedImage rgb = copiarParaTipo(imagem, BufferedImage.TYPE_INT_RGB);

    Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");

    if (!writers.hasNext()) {
      throw new IOException("Encoder JPEG não disponível no servidor.");
    }

    ImageWriter writer = writers.next();

    try (ByteArrayOutputStream saida = new ByteArrayOutputStream();
      ImageOutputStream imageOutputStream = ImageIO.createImageOutputStream(saida)) {
      writer.setOutput(imageOutputStream);

      ImageWriteParam writerParam = writer.getDefaultWriteParam();

      if (writerParam.canWriteCompressed()) {
        writerParam.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        writerParam.setCompressionQuality(qualidade);
      }

      writer.write(null, new javax.imageio.IIOImage(rgb, null, null), writerParam);
      writer.dispose();

      return saida.toByteArray();
    }
    catch (UncheckedIOException e) {
      throw new IOException(e.getCause());
    }
  }

}
