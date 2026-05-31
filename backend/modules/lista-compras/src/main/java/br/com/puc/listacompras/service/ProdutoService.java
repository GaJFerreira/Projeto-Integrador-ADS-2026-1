package br.com.puc.listacompras.service;

import br.com.puc.listacompras.database.entity.Categoria;
import br.com.puc.listacompras.database.entity.Produto;
import br.com.puc.listacompras.database.repository.CategoriaRepository;
import br.com.puc.listacompras.database.repository.ProdutoRepository;
import br.com.puc.listacompras.dto.ProdutoRequestDTO;
import br.com.puc.listacompras.dto.ProdutoResponseDTO;
import br.com.puc.listacompras.exception.model.ResourceNotFoundException;
import br.com.puc.listacompras.exception.model.ServiceException;
import java.text.Normalizer;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class ProdutoService {

  private static final String PRODUTO_NAO_ENCONTRADO = "Produto nao encontrado para o ID informado.";
  private static final String CATEGORIA_NAO_ENCONTRADA = "Categoria nao encontrada para o ID informado.";
  private static final String PRODUTO_DUPLICADO = "Ja existe um produto com este nome: ";

  private final ProdutoRepository produtoRepository;
  private final CategoriaRepository categoriaRepository;
  private final CategoriaService categoriaService;

  @Transactional
  public ProdutoResponseDTO criar(ProdutoRequestDTO dto) {
    produtoRepository.findByNomeIgnoreCase(dto.getNome()).ifPresent(p -> {
      throw new ServiceException(PRODUTO_DUPLICADO + dto.getNome());
    });

    Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
        .orElseThrow(() -> new ResourceNotFoundException(CATEGORIA_NAO_ENCONTRADA));

    Produto produto = toEntity(dto, categoria);
    return toResponseDTO(produtoRepository.save(produto));
  }

  @Transactional(readOnly = true)
  public ProdutoResponseDTO buscarPorId(Long id) {
    Produto produto = produtoRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO));
    return toResponseDTO(produto);
  }

  @Transactional(readOnly = true)
  public List<ProdutoResponseDTO> listarTodos() {
    return produtoRepository.findAll().stream().map(this::toResponseDTO).toList();
  }

  @Transactional(readOnly = true)
  public List<ProdutoResponseDTO> listarAtivos() {
    return produtoRepository.findByAtivoTrue().stream().map(this::toResponseDTO).toList();
  }

  @Transactional(readOnly = true)
  public List<ProdutoResponseDTO> listarPorCategoria(Long categoriaId) {
    if (!categoriaRepository.existsById(categoriaId)) {
      throw new ResourceNotFoundException(CATEGORIA_NAO_ENCONTRADA);
    }
    return produtoRepository.findByCategoriaIdAndAtivoTrue(categoriaId).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<ProdutoResponseDTO> buscarPorNome(String nome) {
    if (nome == null) return List.of();
    return produtoRepository.findByNomeNormalizado(nome.toLowerCase().trim()).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<ProdutoResponseDTO> buscarPorTag(String tag) {
    return produtoRepository.findByTagsContainingIgnoreCaseAndAtivoTrue(tag).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Transactional
  public ProdutoResponseDTO atualizar(Long id, ProdutoRequestDTO dto) {
    Produto produto = produtoRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO));

    if (!produto.getNome().equalsIgnoreCase(dto.getNome())) {
      produtoRepository.findByNomeIgnoreCase(dto.getNome()).ifPresent(p -> {
        throw new ServiceException(PRODUTO_DUPLICADO + dto.getNome());
      });
    }

    Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
        .orElseThrow(() -> new ResourceNotFoundException(CATEGORIA_NAO_ENCONTRADA));

    produto.setNome(dto.getNome());
    produto.setNomeNormalizado(normalizarNome(dto.getNome()));
    produto.setPreco(dto.getPreco());
    produto.setTags(dto.getTags());
    produto.setAtivo(dto.getAtivo());
    produto.setIsPersonalizado(dto.getIsPersonalizado());
    produto.setCategoria(categoria);

    return toResponseDTO(produtoRepository.save(produto));
  }

  @Transactional
  public void deletar(Long id) {
    Produto produto = produtoRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO));
    produto.setAtivo(false);
    produtoRepository.save(produto);
  }

  @Transactional
  public void deletarPermanente(Long id) {
    if (!produtoRepository.existsById(id)) {
      throw new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO);
    }
    produtoRepository.deleteById(id);
  }

  private Produto toEntity(ProdutoRequestDTO dto, Categoria categoria) {
    Produto produto = new Produto();
    produto.setNome(dto.getNome());
    produto.setNomeNormalizado(normalizarNome(dto.getNome()));
    produto.setPreco(dto.getPreco());
    produto.setTags(dto.getTags());
    produto.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);
    produto.setIsPersonalizado(dto.getIsPersonalizado() != null ? dto.getIsPersonalizado() : false);
    produto.setCategoria(categoria);
    return produto;
  }

  private ProdutoResponseDTO toResponseDTO(Produto produto) {
    return new ProdutoResponseDTO(
        produto.getId(),
        produto.getNome(),
        produto.getNomeNormalizado(),
        produto.getPreco(),
        produto.getAtivo(),
        produto.getIsPersonalizado(),
        produto.getTags(),
        categoriaService.buscarPorId(produto.getCategoria().getId()),
        produto.getCreatedAt(),
        produto.getUpdatedAt(),
        produto.getDescricao(),
        produto.getUnidadeMedida(),
        produto.getCustoMedio(),
        produto.getMarca(),
        produto.getPorcaoReferenciaGramas(),
        produto.getCalorias(),
        produto.getProteinas(),
        produto.getCarboidratos(),
        produto.getGordurasTotais(),
        produto.getGordurasSaturadas(),
        produto.getFibras(),
        produto.getSodio(),
        produto.getAcucares()
    );
  }

  private String normalizarNome(String nome) {
    if (nome == null) return null;
    return Normalizer.normalize(nome, Normalizer.Form.NFD)
        .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
        .toLowerCase()
        .trim();
  }
}
