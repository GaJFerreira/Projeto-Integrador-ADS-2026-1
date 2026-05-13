package br.com.puc.listacompras.service;

import br.com.puc.listacompras.database.entity.Categoria;
import br.com.puc.listacompras.database.repository.CategoriaRepository;
import br.com.puc.listacompras.dto.CategoriaRequestDTO;
import br.com.puc.listacompras.dto.CategoriaResponseDTO;
import br.com.puc.listacompras.exception.model.ResourceNotFoundException;
import br.com.puc.listacompras.exception.model.ServiceException;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class CategoriaService {

  private static final String CATEGORIA_NAO_ENCONTRADA = "Categoria nao encontrada para o ID informado.";
  private static final String CATEGORIA_DUPLICADA = "Ja existe uma categoria cadastrada com este nome: ";

  private final CategoriaRepository categoriaRepository;

  @Transactional
  public CategoriaResponseDTO criarCategoria(CategoriaRequestDTO dto) {
    categoriaRepository.findByNomeIgnoreCase(dto.getNome()).ifPresent(c -> {
      throw new ServiceException(CATEGORIA_DUPLICADA + dto.getNome());
    });
    Categoria categoriaSalva = categoriaRepository.save(toEntity(dto));
    return toResponseDTO(categoriaSalva);
  }

  @Transactional(readOnly = true)
  public CategoriaResponseDTO buscarPorId(Long id) {
    Categoria categoria = categoriaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(CATEGORIA_NAO_ENCONTRADA));
    return toResponseDTO(categoria);
  }

  @Transactional(readOnly = true)
  public List<CategoriaResponseDTO> listarTodas() {
    return categoriaRepository.findAll().stream().map(this::toResponseDTO).toList();
  }

  @Transactional(readOnly = true)
  public List<CategoriaResponseDTO> buscarPorNome(String nome) {
    return categoriaRepository.findByNomeContainingIgnoreCase(nome).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Transactional
  public CategoriaResponseDTO atualizar(Long id, CategoriaRequestDTO dto) {
    Categoria categoria = categoriaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(CATEGORIA_NAO_ENCONTRADA));

    if (!categoria.getNome().equalsIgnoreCase(dto.getNome())) {
      categoriaRepository.findByNomeIgnoreCase(dto.getNome()).ifPresent(c -> {
        throw new ServiceException(CATEGORIA_DUPLICADA + dto.getNome());
      });
    }

    categoria.setNome(dto.getNome());
    categoria.setDescricao(dto.getDescricao());
    return toResponseDTO(categoriaRepository.save(categoria));
  }

  @Transactional
  public void deletar(Long id) {
    if (!categoriaRepository.existsById(id)) {
      throw new ResourceNotFoundException(CATEGORIA_NAO_ENCONTRADA);
    }
    categoriaRepository.deleteById(id);
  }

  private Categoria toEntity(CategoriaRequestDTO dto) {
    Categoria categoria = new Categoria();
    categoria.setNome(dto.getNome());
    categoria.setDescricao(dto.getDescricao());
    return categoria;
  }

  private CategoriaResponseDTO toResponseDTO(Categoria categoria) {
    return new CategoriaResponseDTO(
        categoria.getId(),
        categoria.getNome(),
        categoria.getDescricao(),
        categoria.getCreatedAt(),
        categoria.getUpdatedAt()
    );
  }
}
