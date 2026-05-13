package br.com.puc.listacompras.service;

import br.com.puc.listacompras.database.entity.Patologia;
import br.com.puc.listacompras.database.entity.PatologiaItem;
import br.com.puc.listacompras.database.entity.Produto;
import br.com.puc.listacompras.database.repository.PatologiaItemRepository;
import br.com.puc.listacompras.database.repository.PatologiaRepository;
import br.com.puc.listacompras.database.repository.ProdutoRepository;
import br.com.puc.listacompras.dto.PatologiaItemRequestDTO;
import br.com.puc.listacompras.dto.PatologiaItemResponseDTO;
import br.com.puc.listacompras.dto.ProdutoSubstituivelResponseDTO;
import br.com.puc.listacompras.exception.model.ResourceNotFoundException;
import br.com.puc.listacompras.exception.model.ServiceException;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class PatologiaItemService {

  private static final String PATOLOGIA_NAO_ENCONTRADA = "Patologia nao encontrada para o ID informado.";
  private static final String PRODUTO_NAO_ENCONTRADO = "Produto nao encontrado para o ID informado.";
  private static final String PRODUTO_SUGESTAO_NAO_ENCONTRADO = "Produto sugestao nao encontrado para o ID informado.";
  private static final String VINCULO_NAO_ENCONTRADO = "Vinculo nao encontrado para o ID informado.";
  private static final String VINCULO_DUPLICADO = "Este produto ja esta vinculado a esta patologia.";

  private final PatologiaItemRepository patologiaItemRepository;
  private final PatologiaRepository patologiaRepository;
  private final ProdutoRepository produtoRepository;
  private final ProdutoService produtoService;
  private final PatologiaService patologiaService;

  @Transactional
  public PatologiaItemResponseDTO vincular(PatologiaItemRequestDTO dto) {
    Patologia patologia = patologiaRepository.findById(dto.getPatologiaId())
        .orElseThrow(() -> new ResourceNotFoundException(PATOLOGIA_NAO_ENCONTRADA));

    Produto produto = produtoRepository.findById(dto.getProdutoId())
        .orElseThrow(() -> new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO));

    Produto produtoSugestao = null;
    if (dto.getProdutoSugestaoId() != null) {
      produtoSugestao = produtoRepository.findById(dto.getProdutoSugestaoId())
          .orElseThrow(() -> new ResourceNotFoundException(PRODUTO_SUGESTAO_NAO_ENCONTRADO));
    }

    if (patologiaItemRepository.existsByPatologiaIdAndProdutoId(dto.getPatologiaId(), dto.getProdutoId())) {
      throw new ServiceException(VINCULO_DUPLICADO);
    }

    PatologiaItem patologiaItem = toEntity(patologia, produto, produtoSugestao);
    return toResponseDTO(patologiaItemRepository.save(patologiaItem));
  }

  @Transactional(readOnly = true)
  public List<ProdutoSubstituivelResponseDTO> listarProdutosSubstituiveis(Long usuarioId, Long produtoId) {
    return patologiaItemRepository.findProdutosSubstituiveis(usuarioId, produtoId).stream()
        .map(this::toSubstituivelResponseDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public PatologiaItemResponseDTO buscarPorId(Long id) {
    PatologiaItem patologiaItem = patologiaItemRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(VINCULO_NAO_ENCONTRADO));
    return toResponseDTO(patologiaItem);
  }

  @Transactional(readOnly = true)
  public List<PatologiaItemResponseDTO> listarPorPatologia(Long patologiaId) {
    if (!patologiaRepository.existsById(patologiaId)) {
      throw new ResourceNotFoundException(PATOLOGIA_NAO_ENCONTRADA);
    }
    return patologiaItemRepository.findByPatologiaId(patologiaId).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<PatologiaItemResponseDTO> listarPorProduto(Long produtoId) {
    if (!produtoRepository.existsById(produtoId)) {
      throw new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO);
    }
    return patologiaItemRepository.findByProdutoId(produtoId).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public boolean verificarAlerta(Long usuarioId, Long produtoId) {
    return patologiaItemRepository.produtoDeveSerAlertado(usuarioId, produtoId);
  }

  @Transactional
  public void desvincular(Long id) {
    if (!patologiaItemRepository.existsById(id)) {
      throw new ResourceNotFoundException(VINCULO_NAO_ENCONTRADO);
    }
    patologiaItemRepository.deleteById(id);
  }

  @Transactional(readOnly = true)
  public List<ProdutoSubstituivelResponseDTO> listarProdutosSubstituiveisPorPatologia(
      Long patologiaId,
      Long produtoId
  ) {
    return patologiaItemRepository.findProdutosSubstituiveisPorPatologia(patologiaId, produtoId).stream()
        .map(this::toSubstituivelResponseDTO)
        .toList();
  }

  private PatologiaItem toEntity(Patologia patologia, Produto produto, Produto produtoSugestao) {
    PatologiaItem patologiaItem = new PatologiaItem();
    patologiaItem.setPatologia(patologia);
    patologiaItem.setProduto(produto);
    patologiaItem.setProdutoSugestao(produtoSugestao);
    return patologiaItem;
  }

  private PatologiaItemResponseDTO toResponseDTO(PatologiaItem patologiaItem) {
    return new PatologiaItemResponseDTO(
        patologiaItem.getId(),
        patologiaService.buscarPorId(patologiaItem.getPatologia().getId()),
        produtoService.buscarPorId(patologiaItem.getProduto().getId()),
        patologiaItem.getProdutoSugestao() != null
            ? produtoService.buscarPorId(patologiaItem.getProdutoSugestao().getId())
            : null,
        patologiaItem.getCreatedAt(),
        patologiaItem.getUpdatedAt()
    );
  }

  private ProdutoSubstituivelResponseDTO toSubstituivelResponseDTO(PatologiaItem patologiaItem) {
    return new ProdutoSubstituivelResponseDTO(
        patologiaItem.getProduto().getId(),
        patologiaItem.getProduto().getNome(),
        patologiaService.buscarPorId(patologiaItem.getPatologia().getId()),
        patologiaItem.getProdutoSugestao() != null
            ? produtoService.buscarPorId(patologiaItem.getProdutoSugestao().getId())
            : null
    );
  }
}
