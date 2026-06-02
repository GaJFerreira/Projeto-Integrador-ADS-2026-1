package br.com.puc.listacompras.service;

import br.com.puc.listacompras.database.entity.Categoria;
import br.com.puc.listacompras.database.entity.Produto;
import br.com.puc.listacompras.database.repository.CategoriaRepository;
import br.com.puc.listacompras.database.repository.ProdutoRepository;
import br.com.puc.listacompras.dto.CategoriaResponseDTO;
import br.com.puc.listacompras.dto.admin.AdminProdutoRequestDTO;
import br.com.puc.listacompras.dto.admin.AdminProdutoResponseDTO;
import br.com.puc.listacompras.dto.admin.AdminProdutoUpdateCustoDTO;
import br.com.puc.listacompras.dto.admin.AdminProdutoUpdateNutricaoDTO;
import br.com.puc.listacompras.exception.model.ResourceNotFoundException;
import br.com.puc.listacompras.exception.model.ServiceException;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class AdminProdutoService {

  private static final String PRODUTO_NAO_ENCONTRADO = "Produto nao encontrado para o ID informado.";
  private static final String CATEGORIA_NAO_ENCONTRADA = "Categoria nao encontrada para o ID informado.";
  private static final String PRODUTO_DUPLICADO = "Ja existe um produto com este nome: ";

  private final ProdutoRepository produtoRepository;
  private final CategoriaRepository categoriaRepository;

  @Transactional
  public AdminProdutoResponseDTO criar(AdminProdutoRequestDTO dto) {
    produtoRepository.findByNomeIgnoreCase(dto.getNome()).ifPresent(p -> {
      throw new ServiceException(PRODUTO_DUPLICADO + dto.getNome());
    });

    Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
        .orElseThrow(() -> new ResourceNotFoundException(CATEGORIA_NAO_ENCONTRADA));

    Produto produto = new Produto();
    aplicarDto(produto, dto, categoria);
    if (dto.getCustoMedio() != null) {
      produto.setCustoMedioAtualizadoEm(LocalDateTime.now());
    }
    return toResponseDTO(produtoRepository.save(produto));
  }

  @Transactional
  public AdminProdutoResponseDTO atualizar(Long id, AdminProdutoRequestDTO dto) {
    Produto produto = produtoRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO));

    if (!produto.getNome().equalsIgnoreCase(dto.getNome())) {
      produtoRepository.findByNomeIgnoreCase(dto.getNome()).ifPresent(p -> {
        if (!p.getId().equals(id)) {
          throw new ServiceException(PRODUTO_DUPLICADO + dto.getNome());
        }
      });
    }

    Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
        .orElseThrow(() -> new ResourceNotFoundException(CATEGORIA_NAO_ENCONTRADA));

    BigDecimalChanged custoMudou = new BigDecimalChanged(produto.getCustoMedio(), dto.getCustoMedio());
    aplicarDto(produto, dto, categoria);
    if (custoMudou.changed()) {
      produto.setCustoMedioAtualizadoEm(LocalDateTime.now());
    }

    return toResponseDTO(produtoRepository.save(produto));
  }

  @Transactional
  public AdminProdutoResponseDTO atualizarCusto(Long id, AdminProdutoUpdateCustoDTO dto) {
    Produto produto = produtoRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO));
    produto.setCustoMedio(dto.getCustoMedio());
    produto.setCustoMedioAtualizadoEm(LocalDateTime.now());
    return toResponseDTO(produtoRepository.save(produto));
  }

  @Transactional
  public AdminProdutoResponseDTO atualizarNutricao(Long id, AdminProdutoUpdateNutricaoDTO dto) {
    Produto produto = produtoRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO));
    produto.setPorcaoReferenciaGramas(dto.getPorcaoReferenciaGramas());
    produto.setCalorias(dto.getCalorias());
    produto.setProteinas(dto.getProteinas());
    produto.setCarboidratos(dto.getCarboidratos());
    produto.setGordurasTotais(dto.getGordurasTotais());
    produto.setGordurasSaturadas(dto.getGordurasSaturadas());
    produto.setFibras(dto.getFibras());
    produto.setSodio(dto.getSodio());
    produto.setAcucares(dto.getAcucares());
    return toResponseDTO(produtoRepository.save(produto));
  }

  @Transactional
  public void desativar(Long id) {
    Produto produto = produtoRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO));
    produto.setAtivo(false);
    produtoRepository.save(produto);
  }

  @Transactional(readOnly = true)
  public AdminProdutoResponseDTO buscarPorId(Long id) {
    Produto produto = produtoRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO));
    return toResponseDTO(produto);
  }

  @Transactional(readOnly = true)
  public List<AdminProdutoResponseDTO> listarTodos() {
    return produtoRepository.findAll().stream().map(this::toResponseDTO).toList();
  }

  private void aplicarDto(Produto produto, AdminProdutoRequestDTO dto, Categoria categoria) {
    produto.setNome(dto.getNome());
    produto.setNomeNormalizado(normalizarNome(dto.getNome()));
    produto.setCategoria(categoria);
    produto.setMarca(dto.getMarca());
    produto.setUnidadeMedida(dto.getUnidadeMedida());
    produto.setCustoMedio(dto.getCustoMedio());
    produto.setPorcaoReferenciaGramas(dto.getPorcaoReferenciaGramas());
    produto.setCalorias(dto.getCalorias());
    produto.setProteinas(dto.getProteinas());
    produto.setCarboidratos(dto.getCarboidratos());
    produto.setGordurasTotais(dto.getGordurasTotais());
    produto.setGordurasSaturadas(dto.getGordurasSaturadas());
    produto.setFibras(dto.getFibras());
    produto.setSodio(dto.getSodio());
    produto.setAcucares(dto.getAcucares());
    produto.setTags(dto.getTags());
    produto.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);
    if (produto.getIsPersonalizado() == null) {
      produto.setIsPersonalizado(false);
    }
  }

  private AdminProdutoResponseDTO toResponseDTO(Produto produto) {
    CategoriaResponseDTO cat = produto.getCategoria() == null ? null
        : new CategoriaResponseDTO(
            produto.getCategoria().getId(),
            produto.getCategoria().getNome(),
            produto.getCategoria().getDescricao(),
            produto.getCategoria().getCreatedAt(),
            produto.getCategoria().getUpdatedAt()
        );

    return new AdminProdutoResponseDTO(
        produto.getId(),
        produto.getNome(),
        produto.getNomeNormalizado(),
        produto.getMarca(),
        produto.getUnidadeMedida(),
        cat,
        produto.getPreco(),
        produto.getCustoMedio(),
        produto.getCustoMedioAtualizadoEm(),
        produto.getPorcaoReferenciaGramas(),
        produto.getCalorias(),
        produto.getProteinas(),
        produto.getCarboidratos(),
        produto.getGordurasTotais(),
        produto.getGordurasSaturadas(),
        produto.getFibras(),
        produto.getSodio(),
        produto.getAcucares(),
        produto.getTags(),
        produto.getAtivo(),
        produto.getIsPersonalizado(),
        produto.getCreatedAt(),
        produto.getUpdatedAt()
    );
  }

  private String normalizarNome(String nome) {
    if (nome == null) return null;
    return Normalizer.normalize(nome, Normalizer.Form.NFD)
        .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
        .toLowerCase()
        .trim();
  }

  // Tipo auxiliar para detectar mudanca de BigDecimal de forma null-safe.
  private static final class BigDecimalChanged {
    private final java.math.BigDecimal antes;
    private final java.math.BigDecimal depois;

    BigDecimalChanged(java.math.BigDecimal antes, java.math.BigDecimal depois) {
      this.antes = antes;
      this.depois = depois;
    }

    boolean changed() {
      if (antes == null && depois == null) return false;
      if (antes == null || depois == null) return true;
      return antes.compareTo(depois) != 0;
    }
  }
}
