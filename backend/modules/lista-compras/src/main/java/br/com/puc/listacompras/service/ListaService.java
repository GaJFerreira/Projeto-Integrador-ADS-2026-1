package br.com.puc.listacompras.service;

import br.com.puc.listacompras.database.entity.ItemLista;
import br.com.puc.listacompras.database.entity.ItemListaId;
import br.com.puc.listacompras.database.entity.Lista;
import br.com.puc.listacompras.database.entity.Patologia;
import br.com.puc.listacompras.database.entity.Produto;
import br.com.puc.listacompras.database.enums.StatusListaEnum;
import br.com.puc.listacompras.database.repository.ItemListaRepository;
import br.com.puc.listacompras.database.repository.ListaRepository;
import br.com.puc.listacompras.database.repository.PatologiaRepository;
import br.com.puc.listacompras.database.repository.ProdutoRepository;
import br.com.puc.listacompras.database.repository.UsuarioPatologiaRepository;
import br.com.puc.listacompras.dto.ItemListaResponseDTO;
import br.com.puc.listacompras.dto.ListaCreateRequestDTO;
import br.com.puc.listacompras.dto.ListaItemCreateDTO;
import br.com.puc.listacompras.dto.ListaResponseDTO;
import br.com.puc.listacompras.exception.model.ResourceNotFoundException;
import br.com.puc.listacompras.exception.model.ServiceException;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@AllArgsConstructor
public class ListaService {

  private static final String LISTA_NAO_ENCONTRADA = "Lista nao encontrada para o ID informado.";
  private static final String PRODUTO_NAO_ENCONTRADO = "Produto nao encontrado para o ID informado.";
  private static final String PATOLOGIA_NAO_ENCONTRADA = "Patologia nao encontrada para o ID informado.";
  private static final String TITULO_DUPLICADO = "Ja existe uma lista com este titulo para o usuario.";
  private static final String TITULO_OBRIGATORIO = "Titulo da lista e obrigatorio.";
  private static final String LISTA_SEM_ITENS = "A lista deve possuir ao menos um item.";
  private static final String LISTA_JA_FINALIZADA = "Esta lista ja esta finalizada.";
  private static final String LISTA_NAO_FINALIZADA = "So e possivel reabrir listas que estejam finalizadas.";
  private static final String TEMPLATE_NAO_DELETAVEL = "Nao e possivel deletar uma lista template.";
  private static final String DADOS_NAO_INFORMADOS = "Dados da lista nao informados.";
  private static final String PRODUTO_OBRIGATORIO_ITEM = "ProdutoId e obrigatorio nos itens da lista.";
  private static final String QUANTIDADE_INVALIDA = "Quantidade deve ser maior que zero.";

  private final ListaRepository listaRepository;
  private final ItemListaRepository itemListaRepository;
  private final ItemListaService itemListaService;
  private final ProdutoRepository produtoRepository;
  private final UsuarioPatologiaRepository usuarioPatologiaRepository;
  private final PatologiaRepository patologiaRepository;

  @Transactional
  public ListaResponseDTO criarComItens(Long usuarioId, ListaCreateRequestDTO dto) {
    log.info("Iniciando criacao da lista. usuarioId={}", usuarioId);

    if (listaRepository.existsByUsuarioIdAndTituloIgnoreCase(usuarioId, dto.getTitulo())) {
      throw new ServiceException(TITULO_DUPLICADO);
    }

    boolean isTemplate = Boolean.TRUE.equals(dto.getIsTemplate());
    if (!isTemplate && (dto.getItens() == null || dto.getItens().isEmpty())) {
      throw new ServiceException(LISTA_SEM_ITENS);
    }

    Lista lista = new Lista();
    lista.setTitulo(dto.getTitulo());
    lista.setUsuarioId(usuarioId);
    lista.setTemplate(isTemplate);

    if (dto.getPatologiaId() != null) {
      Patologia patologia = patologiaRepository.findById(dto.getPatologiaId())
          .orElseThrow(() -> new ResourceNotFoundException(PATOLOGIA_NAO_ENCONTRADA));
      lista.setPatologia(patologia);
    }

    Lista listaSalva = listaRepository.save(lista);

    if (dto.getItens() != null) {
      for (ListaItemCreateDTO itemDTO : dto.getItens()) {
        Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
            .orElseThrow(() -> new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO));

        ItemListaId id = new ItemListaId(listaSalva.getId(), produto.getId());

        ItemLista item = new ItemLista();
        item.setId(id);
        item.setLista(listaSalva);
        item.setProduto(produto);
        item.setQuantidade(
            itemDTO.getQtd() != null
                ? BigDecimal.valueOf(itemDTO.getQtd())
                : BigDecimal.ONE
        );

        itemListaRepository.save(item);
      }
    }

    log.info(
        "Lista criada com sucesso. usuarioId={}, listaId={}, template={}, itens={}",
        usuarioId,
        listaSalva.getId(),
        isTemplate,
        dto.getItens() != null ? dto.getItens().size() : 0
    );

    return toResponseDTO(listaSalva);
  }

  @Transactional(readOnly = true)
  public ListaResponseDTO buscarPorId(Long id) {
    Lista lista = listaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(LISTA_NAO_ENCONTRADA));
    return toResponseDTO(lista);
  }

  @Transactional(readOnly = true)
  public List<ListaResponseDTO> listarListasNormais(Long usuarioId) {
    return listaRepository.findByUsuarioIdAndTemplateFalseOrderByCreatedAtDesc(usuarioId).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<ListaResponseDTO> listarPorUsuarioEStatus(Long usuarioId, StatusListaEnum status) {
    return listaRepository.findByUsuarioIdAndStatusOrderByCreatedAtDesc(usuarioId, status).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<ListaResponseDTO> listarAbertasPorUsuario(Long usuarioId) {
    return listarPorUsuarioEStatus(usuarioId, StatusListaEnum.ABERTA);
  }

  @Transactional(readOnly = true)
  public List<ListaResponseDTO> listarFinalizadasPorUsuario(Long usuarioId) {
    return listarPorUsuarioEStatus(usuarioId, StatusListaEnum.FINALIZADA);
  }

  @Transactional(readOnly = true)
  public List<ListaResponseDTO> listarTemplates(Long usuarioId) {
    List<Long> patologiaIds = usuarioPatologiaRepository.findPatologiaIdsByUsuarioId(usuarioId);

    List<Lista> listas = (patologiaIds == null || patologiaIds.isEmpty())
        ? listaRepository.findByTemplateTrueAndPatologiaIsNullOrderByTituloAsc()
        : listaRepository.buscarTemplatesPorPatologiasOuGenericos(patologiaIds);

    return listas.stream().map(this::toResponseDTO).toList();
  }

  @Transactional
  public ListaResponseDTO finalizarLista(Long id) {
    Lista lista = listaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(LISTA_NAO_ENCONTRADA));

    if (lista.getStatus() == StatusListaEnum.FINALIZADA) {
      throw new ServiceException(LISTA_JA_FINALIZADA);
    }

    lista.setStatus(StatusListaEnum.FINALIZADA);
    return toResponseDTO(listaRepository.save(lista));
  }

  @Transactional
  public ListaResponseDTO reabrirLista(Long id) {
    Lista lista = listaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(LISTA_NAO_ENCONTRADA));

    if (lista.getStatus() != StatusListaEnum.FINALIZADA) {
      throw new ServiceException(LISTA_NAO_FINALIZADA);
    }

    lista.setStatus(StatusListaEnum.ABERTA);
    return toResponseDTO(listaRepository.save(lista));
  }

  @Transactional
  public void deletar(Long id) {
    Lista lista = listaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(LISTA_NAO_ENCONTRADA));

    if (Boolean.TRUE.equals(lista.getTemplate())) {
      throw new ServiceException(TEMPLATE_NAO_DELETAVEL);
    }

    listaRepository.deleteById(id);
  }

  @Transactional
  public ListaResponseDTO atualizarLista(Long id, ListaCreateRequestDTO dto) {
    if (dto == null) {
      throw new ServiceException(DADOS_NAO_INFORMADOS);
    }
    if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
      throw new ServiceException(TITULO_OBRIGATORIO);
    }

    Lista lista = listaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(LISTA_NAO_ENCONTRADA));

    Long usuarioId = lista.getUsuarioId();

    String novoTitulo = dto.getTitulo().trim();
    if (!novoTitulo.equalsIgnoreCase(lista.getTitulo())
        && listaRepository.existsByUsuarioIdAndTituloIgnoreCase(usuarioId, novoTitulo)) {
      throw new ServiceException(TITULO_DUPLICADO);
    }

    lista.setTitulo(novoTitulo);

    if (dto.getIsTemplate() != null) {
      lista.setTemplate(dto.getIsTemplate());
    }

    if (dto.getPatologiaId() != null) {
      Patologia patologia = patologiaRepository.findById(dto.getPatologiaId())
          .orElseThrow(() -> new ResourceNotFoundException(PATOLOGIA_NAO_ENCONTRADA));
      lista.setPatologia(patologia);
    } else {
      lista.setPatologia(null);
    }

    List<ItemLista> itensAntigos = itemListaRepository.findById_ListaId(lista.getId());
    if (!itensAntigos.isEmpty()) {
      itemListaRepository.deleteAll(itensAntigos);
    }

    if (dto.getItens() != null) {
      dto.getItens().forEach(itemDTO -> {
        if (itemDTO.getProdutoId() == null) {
          throw new ServiceException(PRODUTO_OBRIGATORIO_ITEM);
        }
        if (itemDTO.getQtd() == null || itemDTO.getQtd().doubleValue() <= 0) {
          throw new ServiceException(QUANTIDADE_INVALIDA);
        }

        Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
            .orElseThrow(() -> new ResourceNotFoundException(PRODUTO_NAO_ENCONTRADO));

        ItemListaId chave = new ItemListaId(lista.getId(), produto.getId());

        ItemLista item = new ItemLista();
        item.setId(chave);
        item.setLista(lista);
        item.setProduto(produto);
        item.setQuantidade(BigDecimal.valueOf(itemDTO.getQtd()));

        itemListaRepository.save(item);
      });
    }

    listaRepository.save(lista);
    return toResponseDTO(lista);
  }

  private ListaResponseDTO toResponseDTO(Lista lista) {
    List<ItemListaResponseDTO> itens = itemListaRepository
        .findById_ListaId(lista.getId())
        .stream()
        .map(itemListaService::toResponseDTO)
        .toList();

    Long patologiaId = lista.getPatologia() != null ? lista.getPatologia().getId() : null;

    return new ListaResponseDTO(
        lista.getId(),
        lista.getTitulo(),
        lista.getUsuarioId(),
        patologiaId,
        lista.getTemplate(),
        lista.getCreatedAt(),
        lista.getDescricao(),
        lista.getStatus() != null ? lista.getStatus().name() : null,
        itens
    );
  }
}
