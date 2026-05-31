package br.com.puc.saborfamilia.config;

import br.com.puc.saborfamilia.utils.MidiaPathResolver;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Slf4j
@Configuration
public class UploadMediaConfig {

  @Value("${sabor-familia.upload.base-dir}")
  private String baseDir;

  @PostConstruct
  void configurarDiretorio() throws IOException {
    Path diretorioBase = configurarDiretorioBase();
    Files.createDirectories(diretorioBase.resolve(MidiaPathResolver.DIRETORIO_RAIZ));
    log.info("Armazenamento de mídia Sabor Família: {}", diretorioBase);
  }

  public Path configurarDiretorioBase() {
    if (!StringUtils.hasText(baseDir)) {
      throw new IllegalStateException("O diretório de destino dos uploads deve ser informado.");
    }

    return Path.of(baseDir).toAbsolutePath().normalize();
  }

}
