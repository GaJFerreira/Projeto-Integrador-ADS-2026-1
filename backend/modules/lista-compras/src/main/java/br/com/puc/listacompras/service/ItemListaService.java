package br.com.puc.listacompras.service;

import br.com.puc.listacompras.database.entity.ItemLista;
import br.com.puc.listacompras.database.entity.ItemListaId;
import br.com.puc.listacompras.database.entity.Lista;
import br.com.puc.listacompras.database.entity.Produto;
import br.com.puc.listacompras.database.enums.StatusListaEnum;
import br.com.puc.listacompras.database.repository.ItemListaRepository;
import br.com.puc.listacompras.database.repository.ListaRepository;
import br.com.puc.listacompras.database.repository.ProdutoRepository;
import br.com.puc.listacompras.dto.ItemListaRequestDTO;
import br.com.puc.listacompras.dto.ItemListaResponseDTO;
import br.com.puc.listacompras.exception.model.ResourceNotFoundException;
import br.com.puc.listacompras.exception.model.ServiceException;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class ItemListaService {

  private static final String LISTA_NAO_ENCONTRADA = "Lista nao encontrada para o ID informado.";
  private static final String PRODUTO_NAO_ENCONTRADO = "Produto nao encontrado para o ID informado.";
  private static final String ITEM_NAO_ENCONTRADO = "Item nao encontrado na lista informada.";
  private static final String LISTA_FINALIZADA_NAO_ALTERA = "Nao e possivel modificar itens de uma lista finalizada.";
  private static final String PRODUTO_DUPLICADO_LISTA = "Este produto ja esta na lista. Use atualizar para modificar a quantidade.";
  private static final String QUANTIDADE_INVALIDA = "A quantidade deve ser maior que zero.";

  private final ItemListaRepository itemListaRepository;
  private final ListaRepository listaRepository;
  private final ProdutoRepository produtoRepository;
  private final ProdutoService produtoService;

  @Transactional
  public ItemListaResponseDTO adicionarItem(ItemListaRequestDTO dto) {
    Lista lista = listaRepository.findById(dto.getListaId())
        .orElseThrow(() -> new ResourceNotFoundException(LISTA_NAO_ENCONTRADA));

    if (lista.getStatus() == StatusListaEnum.FINALIZADA) {
      throw new ServiceException(LISTA_FINALIZADA_NAO_ALTERA);
    }

    Produto produto = produtoRepository.findById(dto.getProdutoId())
        .orElseThrow(() -> new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO));

    if (itemListaRepository.existsById_ListaIdAndId_ProdutoId(dto.getListaId(), dto.getProdutoId())) {
      throw new ServiceException(PRODUTO_DUPLICADO_LISTA);
    }

    ItemLista itemLista = toEntity(dto, lista, produto);
    return toResponseDTO(itemListaRepository.save(itemLista));
  }

  @Transactional(readOnly = true)
  public ItemListaResponseDTO buscarPorId(Long listaId, Long produtoId) {
    ItemLista itemLista = itemListaRepository.findById_ListaIdAndId_ProdutoId(listaId, produtoId)
        .orElseThrow(() -> new ResourceNotFoundException(ITEM_NAO_ENCONTRADO));
    return toResponseDTO(itemLista);
  }

  @Transactional(readOnly = true)
  public List<ItemListaResponseDTO> listarPorLista(Long listaId) {
    if (!listaRepository.existsById(listaId)) {
      throw new ResourceNotFoundException(LISTA_NAO_ENCONTRADA);
    }
    return itemListaRepository.findById_ListaId(listaId).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Transactional
  public ItemListaResponseDTO atualizarQuantidade(Long listaId, Long produtoId, BigDecimal novaQuantidade) {
    ItemLista itemLista = itemListaRepository.findById_ListaIdAndId_ProdutoId(listaId, produtoId)
        .orElseThrow(() -> new ResourceNotFoundException(ITEM_NAO_ENCONTRADO));

    if (itemLista.getLista().getStatus() == StatusListaEnum.FINALIZADA) {
      throw new ServiceException(LISTA_FINALIZADA_NAO_ALTERA);
    }

    if (novaQuantidade == null || novaQuantidade.compareTo(BigDecimal.ZERO) <= 0) {
      throw new ServiceException(QUANTIDADE_INVALIDA);
    }

    itemLista.setQuantidade(novaQuantidade);
    return toResponseDTO(itemListaRepository.save(itemLista));
  }

  @Transactional
  public void removerItem(Long listaId, Long produtoId) {
    ItemLista itemLista = itemListaRepository.findById_ListaIdAndId_ProdutoId(listaId, produtoId)
        .orElseThrow(() -> new ResourceNotFoundException(ITEM_NAO_ENCONTRADO));

    if (itemLista.getLista().getStatus() == StatusListaEnum.FINALIZADA) {
      throw new ServiceException(LISTA_FINALIZADA_NAO_ALTERA);
    }

    itemListaRepository.deleteById_ListaIdAndId_ProdutoId(listaId, produtoId);
  }

  public ItemListaResponseDTO toResponseDTO(ItemLista itemLista) {
    return new ItemListaResponseDTO(
        itemLista.getId().getListaId(),
        itemLista.getId().getProdutoId(),
        produtoService.buscarPorId(itemLista.getProduto().getId()),
        itemLista.getQuantidade(),
        itemLista.getComprado(),
        itemLista.getCreatedAt()
    );
  }

  private ItemLista toEntity(ItemListaRequestDTO dto, Lista lista, Produto produto) {
    ItemListaId id = new ItemListaId(dto.getListaId(), dto.getProdutoId());

    ItemLista itemLista = new ItemLista();
    itemLista.setId(id);
    itemLista.setLista(lista);
    itemLista.setProduto(produto);
    itemLista.setQuantidade(dto.getQuantidade() != null ? dto.getQuantidade() : BigDecimal.ONE);
    return itemLista;
  }
}
