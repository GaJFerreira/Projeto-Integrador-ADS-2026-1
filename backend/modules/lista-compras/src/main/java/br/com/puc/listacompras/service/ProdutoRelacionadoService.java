package br.com.puc.listacompras.service;

import br.com.puc.listacompras.database.entity.ProdutoRelacionado;
import br.com.puc.listacompras.database.repository.ProdutoRelacionadoRepository;
import br.com.puc.listacompras.database.repository.ProdutoRepository;
import br.com.puc.listacompras.dto.ProdutoRelacionadoResponseDTO;
import br.com.puc.listacompras.exception.model.ResourceNotFoundException;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class ProdutoRelacionadoService {

  private static final String PRODUTO_NAO_ENCONTRADO = "Produto nao encontrado para o ID informado.";

  private final ProdutoRelacionadoRepository produtoRelacionadoRepository;
  private final ProdutoRepository produtoRepository;
  private final ProdutoService produtoService;

  @Transactional(readOnly = true)
  public List<ProdutoRelacionadoResponseDTO> listarProdutosRelacionados(Long produtoId) {
    if (!produtoRepository.existsById(produtoId)) {
      throw new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO);
    }

    return produtoRelacionadoRepository.findProdutosRelacionados(produtoId).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<ProdutoRelacionadoResponseDTO> listarTopProdutosRelacionados(Long produtoId, int limit) {
    if (!produtoRepository.existsById(produtoId)) {
      throw new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO);
    }

    return produtoRelacionadoRepository.findTopProdutosRelacionados(produtoId, PageRequest.of(0, limit)).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  private ProdutoRelacionadoResponseDTO toResponseDTO(ProdutoRelacionado produtoRelacionado) {
    return new ProdutoRelacionadoResponseDTO(
        produtoRelacionado.getId().getProdutoId(),
        produtoRelacionado.getId().getSimilarId(),
        produtoService.buscarPorId(produtoRelacionado.getSimilar().getId()),
        produtoRelacionado.getAfinidade(),
        produtoRelacionado.getAtualizadoEm()
    );
  }
}
