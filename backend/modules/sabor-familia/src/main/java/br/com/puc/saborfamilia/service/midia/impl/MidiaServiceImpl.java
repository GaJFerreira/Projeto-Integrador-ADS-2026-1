package br.com.puc.saborfamilia.service.midia.impl;

import br.com.puc.saborfamilia.config.UploadMediaConfig;
import br.com.puc.saborfamilia.database.entity.MidiaEntity;
import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.entity.ReceitaEntity;
import br.com.puc.saborfamilia.database.repository.MidiaRepository;
import br.com.puc.saborfamilia.database.repository.PerfilRepository;
import br.com.puc.saborfamilia.database.repository.ReceitaRepository;
import br.com.puc.saborfamilia.enums.ContextoMidiaEnum;
import br.com.puc.saborfamilia.enums.FormatoMidiaEnum;
import br.com.puc.saborfamilia.enums.TipoEntidadeEnum;
import br.com.puc.saborfamilia.exception.model.ResourceNotFoundException;
import br.com.puc.saborfamilia.exception.model.ServiceException;
import br.com.puc.saborfamilia.service.midia.MidiaService;
import br.com.puc.saborfamilia.service.midia.dto.MidiaResponse;
import br.com.puc.saborfamilia.utils.MidiaUtils;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class MidiaServiceImpl implements MidiaService {

  private static final String ARQUIVO_OBRIGATORIO = "É necessário enviar um arquivo de imagem.";
  private static final String TIPO_INVALIDO = "Formato de imagem não permitido. Use JPEG ou PNG.";
  private static final String TAMANHO_EXCEDIDO = "A imagem excede o tamanho máximo permitido.";
  private static final String LARGURA_EXCEDIDA = "A largura da imagem excede o máximo permitido no upload.";
  private static final String FALHA_PROCESSAR = "Não foi possível processar a imagem enviada.";
  private static final String MIDIA_PERFIL_NAO_ENCONTRADA = "Mídia não encontrada para o perfil informado.";
  private static final String MIDIA_RECEITA_NAO_ENCONTRADA = "Mídia não encontrada para a receita informada.";
  private static final String PERFIL_NAO_ENCONTRADO = "Perfil não encontrado para o usuário informado.";
  private static final String TIPO_ENTIDADE_INVALIDO = "O tipo de entidade informado é inválido.";
  private static final String RECEITA_NAO_ENCONTRADA = "Receita não encontrada para o ID informado.";
  private static final String SEM_PERMISSAO_REMOCAO = "Não foi possível alterar a mídia da receita, o usuário informado não é o criador.";

  private final MidiaRepository midiaRepository;
  private final PerfilRepository perfilRepository;
  private final ReceitaRepository receitaRepository;
  private final UploadMediaConfig uploadMediaConfig;

  @Value("${sabor-familia.upload.max-upload-bytes}")
  private long maxUploadBytes;

  @Value("${sabor-familia.upload.max-upload-width-px}")
  private int maxUploadWidthPx;

  @Override
  @Transactional(readOnly = true)
  public ResponseEntity<byte[]> buscarMidia(
    TipoEntidadeEnum tipoEntidade,
    Long entidadeId,
    ContextoMidiaEnum contexto
  ) {

    MidiaResponse conteudo = buscarConteudo(tipoEntidade, entidadeId, contexto)
      .orElseThrow(() -> switch (tipoEntidade) {
        case PERFIL -> new ResourceNotFoundException(MIDIA_PERFIL_NAO_ENCONTRADA);
        case RECEITA -> new ResourceNotFoundException(MIDIA_RECEITA_NAO_ENCONTRADA);
        default -> new ServiceException(TIPO_ENTIDADE_INVALIDO);
      });

    return ResponseEntity.ok()
      .contentType(MediaType.parseMediaType(conteudo.contentType()))
      .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
      .body(conteudo.dados());
  }

  @Override
  @Transactional
  public void salvarMidia(Long usuarioId, TipoEntidadeEnum tipoEntidade, Long entidadeId, MultipartFile arquivo) {
    switch (tipoEntidade) {
      case PERFIL -> {
        PerfilEntity perfil = perfilRepository.findByUsuarioId(usuarioId)
          .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

        persistirMidia(tipoEntidade, perfil.getId(), arquivo, UploadMediaConfig.DIRETORIO_PERFIS);
      }
      case RECEITA -> {
        PerfilEntity perfil = perfilRepository.findByUsuarioId(usuarioId)
          .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

        ReceitaEntity receita = receitaRepository.findById(entidadeId)
          .orElseThrow(() -> new ResourceNotFoundException(RECEITA_NAO_ENCONTRADA));

        if (!receita.getPerfil().getId().equals(perfil.getId())) {
          throw new ServiceException(SEM_PERMISSAO_REMOCAO);
        }

        persistirMidia(tipoEntidade, receita.getId(), arquivo, UploadMediaConfig.DIRETORIO_RECEITAS);
      }
      default -> throw new ServiceException(TIPO_ENTIDADE_INVALIDO);
    }
  }

  @Override
  @Transactional(readOnly = true)
  public boolean possuiMidia(TipoEntidadeEnum tipoEntidade, Long entidadeId) {
    return midiaRepository.existsByTipoEntidadeAndEntidadeId(tipoEntidade, entidadeId);
  }

  @Override
  @Transactional(readOnly = true)
  public Set<Long> buscarEntidadeIdsComMidia(TipoEntidadeEnum tipoEntidade, Collection<Long> entidadeIds) {
    if (entidadeIds == null || entidadeIds.isEmpty()) {
      return Set.of();
    }

    List<Long> idsDistintos = entidadeIds.stream()
      .filter(Objects::nonNull)
      .distinct()
      .toList();

    if (idsDistintos.isEmpty()) {
      return Set.of();
    }

    return Set.copyOf(
      midiaRepository.findEntidadeIdsByTipoEntidadeAndEntidadeIdIn(tipoEntidade, idsDistintos)
    );
  }

  @Override
  @Transactional
  public void removerMidia(TipoEntidadeEnum tipoEntidade, Long entidadeId) {
    midiaRepository.findByTipoEntidadeAndEntidadeId(tipoEntidade, entidadeId)
      .ifPresent(midia -> {
        removerArquivo(midia.getCaminhoRelativo());
        midiaRepository.delete(midia);
      });
  }

  private void persistirMidia(TipoEntidadeEnum tipoEntidade, Long entidadeId, MultipartFile arquivo, String diretorio) {
    validarArquivo(arquivo);

    FormatoMidiaEnum formato;

    try {
      formato = MidiaUtils.ajustarFormato(arquivo.getContentType());
    }
    catch (IOException e) {
      throw new ServiceException(TIPO_INVALIDO);
    }

    byte[] imagemOriginal;

    try {
      imagemOriginal = MidiaUtils.codificarMidiaOriginal(arquivo.getInputStream(), maxUploadWidthPx, formato);
    }
    catch (IOException e) {
      if (MidiaUtils.MENSAGEM_LARGURA_UPLOAD_EXCEDIDA.equals(e.getMessage())) {
        throw new ServiceException(LARGURA_EXCEDIDA);
      }

      log.error("Erro ao processar imagem: tipo={}, entidadeId={}", tipoEntidade, entidadeId, e);
      throw new ServiceException(FALHA_PROCESSAR);
    }

    if (imagemOriginal.length > maxUploadBytes) {
      throw new ServiceException(TAMANHO_EXCEDIDO);
    }

    String caminhoRelativo = diretorio + "/" + entidadeId + formato.getExtensao();
    Path destino = validarCaminhoArquivo(caminhoRelativo);

    midiaRepository.findByTipoEntidadeAndEntidadeId(tipoEntidade, entidadeId)
      .ifPresent(midiaExistente -> {
        if (!caminhoRelativo.equals(midiaExistente.getCaminhoRelativo())) {
          removerArquivo(midiaExistente.getCaminhoRelativo());
        }
      });

    try {
      Files.createDirectories(destino.getParent());
      Files.write(destino, imagemOriginal);
    }
    catch (IOException e) {
      log.error("Erro ao gravar arquivo no disco: {}", destino, e);
      throw new ServiceException(FALHA_PROCESSAR);
    }

    MidiaEntity midia = midiaRepository.findByTipoEntidadeAndEntidadeId(tipoEntidade, entidadeId)
      .orElseGet(() -> MidiaEntity.builder()
        .tipoEntidade(tipoEntidade)
        .entidadeId(entidadeId)
        .dataCadastro(LocalDateTime.now())
        .build());

    midia.setContentType(formato.getContentType());
    midia.setCaminhoRelativo(caminhoRelativo);
    midia.setTamanhoBytes((long) imagemOriginal.length);
    midia.setUltimaAtualizacao(LocalDateTime.now());

    midiaRepository.save(midia);
  }

  private Optional<MidiaResponse> buscarConteudo(
    TipoEntidadeEnum tipoEntidade,
    Long entidadeId,
    ContextoMidiaEnum contexto
  ) {
    return midiaRepository.findByTipoEntidadeAndEntidadeId(tipoEntidade, entidadeId)
      .flatMap(midia -> {
        try {
          Path arquivo = validarCaminhoArquivo(midia.getCaminhoRelativo());

          if (!Files.exists(arquivo)) {
            log.warn("Metadado de mídia sem arquivo no disco: tipo={}, entidadeId={}, caminho={}",
              tipoEntidade, entidadeId, midia.getCaminhoRelativo());
            return Optional.empty();
          }

          byte[] original = Files.readAllBytes(arquivo);
          FormatoMidiaEnum formato = MidiaUtils.ajustarFormato(midia.getContentType());
          byte[] ajustada = MidiaUtils.redimensionarMidia(original, contexto.getLarguraMaximaPx(), formato);

          return Optional.of(new MidiaResponse(ajustada, formato.getContentType()));
        }
        catch (IOException e) {
          log.error("Falha ao ler mídia: tipo={}, entidadeId={}, contexto={}", tipoEntidade, entidadeId, contexto, e);
          throw new ServiceException(FALHA_PROCESSAR);
        }
      });
  }

  private void validarArquivo(MultipartFile arquivo) {
    if (arquivo == null || arquivo.isEmpty()) {
      throw new ServiceException(ARQUIVO_OBRIGATORIO);
    }

    if (!MidiaUtils.validarContentType(arquivo.getContentType())) {
      throw new ServiceException(TIPO_INVALIDO);
    }
  }

  private Path validarCaminhoArquivo(String caminhoRelativo) {
    if (!StringUtils.hasText(caminhoRelativo) || caminhoRelativo.contains("..")) {
      throw new ServiceException(FALHA_PROCESSAR);
    }

    Path base = uploadMediaConfig.configurarDiretorioBase();
    Path diretorio = base.resolve(caminhoRelativo).normalize();

    if (!diretorio.startsWith(base)) {
      throw new ServiceException(FALHA_PROCESSAR);
    }

    return diretorio;
  }

  private void removerArquivo(String caminhoRelativo) {
    try {
      Path arquivo = validarCaminhoArquivo(caminhoRelativo);
      Files.deleteIfExists(arquivo);
    }
    catch (IOException | ServiceException e) {
      log.warn("Não foi possível remover arquivo de mídia: {}", caminhoRelativo, e);
    }
  }

}
