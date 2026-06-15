package br.com.puc.listacompras.service;

import br.com.puc.listacompras.database.entity.Patologia;
import br.com.puc.listacompras.database.entity.UsuarioPatologia;
import br.com.puc.listacompras.database.repository.PatologiaRepository;
import br.com.puc.listacompras.database.repository.UsuarioPatologiaRepository;
import br.com.puc.listacompras.dto.PatologiaResponseDTO;
import br.com.puc.listacompras.dto.admin.AdminPatologiaRequestDTO;
import br.com.puc.listacompras.exception.model.ResourceNotFoundException;
import br.com.puc.listacompras.exception.model.ServiceException;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class AdminPatologiaService {

  private static final String NAO_ENCONTRADA = "Patologia nao encontrada para o ID informado.";
  private static final String NOME_DUPLICADO = "Ja existe uma patologia com este nome.";
  private static final String VINCULO_DUPLICADO = "Este usuario ja possui esta patologia vinculada.";
  private static final String VINCULO_NAO_ENCONTRADO = "Vinculo usuario-patologia nao encontrado.";

  private final PatologiaRepository patologiaRepository;
  private final UsuarioPatologiaRepository usuarioPatologiaRepository;

  @Transactional(readOnly = true)
  public List<PatologiaResponseDTO> listarTodas() {
    return patologiaRepository.findAllByOrderByNomeAsc().stream()
        .map(this::toDTO)
        .toList();
  }

  @Transactional
  public PatologiaResponseDTO criar(AdminPatologiaRequestDTO dto) {
    if (patologiaRepository.existsByNomeIgnoreCase(dto.getNome().trim())) {
      throw new ServiceException(NOME_DUPLICADO);
    }
    Patologia p = new Patologia();
    p.setNome(dto.getNome().trim());
    p.setDescricao(dto.getDescricao() != null ? dto.getDescricao().trim() : null);
    return toDTO(patologiaRepository.save(p));
  }

  @Transactional
  public PatologiaResponseDTO atualizar(Long id, AdminPatologiaRequestDTO dto) {
    Patologia p = patologiaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(NAO_ENCONTRADA));
    boolean nomeAlterado = !p.getNome().equalsIgnoreCase(dto.getNome().trim());
    if (nomeAlterado && patologiaRepository.existsByNomeIgnoreCase(dto.getNome().trim())) {
      throw new ServiceException(NOME_DUPLICADO);
    }
    p.setNome(dto.getNome().trim());
    p.setDescricao(dto.getDescricao() != null ? dto.getDescricao().trim() : null);
    return toDTO(patologiaRepository.save(p));
  }

  @Transactional
  public void excluir(Long id) {
    if (!patologiaRepository.existsById(id)) {
      throw new ResourceNotFoundException(NAO_ENCONTRADA);
    }
    patologiaRepository.deleteById(id);
  }

  @Transactional(readOnly = true)
  public List<Long> listarUsuariosDaPatologia(Long patologiaId) {
    if (!patologiaRepository.existsById(patologiaId)) {
      throw new ResourceNotFoundException(NAO_ENCONTRADA);
    }
    return usuarioPatologiaRepository.findUsuarioIdsByPatologiaId(patologiaId);
  }

  @Transactional
  public void vincularUsuario(Long patologiaId, Long usuarioId) {
    Patologia patologia = patologiaRepository.findById(patologiaId)
        .orElseThrow(() -> new ResourceNotFoundException(NAO_ENCONTRADA));
    if (usuarioPatologiaRepository.existsByUsuarioIdAndPatologiaId(usuarioId, patologiaId)) {
      throw new ServiceException(VINCULO_DUPLICADO);
    }
    UsuarioPatologia up = new UsuarioPatologia();
    up.setUsuarioId(usuarioId);
    up.setPatologia(patologia);
    usuarioPatologiaRepository.save(up);
  }

  @Transactional
  public void desvincularUsuario(Long patologiaId, Long usuarioId) {
    if (!patologiaRepository.existsById(patologiaId)) {
      throw new ResourceNotFoundException(NAO_ENCONTRADA);
    }
    if (!usuarioPatologiaRepository.existsByUsuarioIdAndPatologiaId(usuarioId, patologiaId)) {
      throw new ResourceNotFoundException(VINCULO_NAO_ENCONTRADO);
    }
    usuarioPatologiaRepository.deleteByUsuarioIdAndPatologiaId(usuarioId, patologiaId);
  }

  private PatologiaResponseDTO toDTO(Patologia p) {
    return new PatologiaResponseDTO(p.getId(), p.getNome(), p.getDescricao());
  }
}
