package br.com.puc.listacompras.service;

import br.com.puc.listacompras.database.entity.Patologia;
import br.com.puc.listacompras.database.repository.PatologiaRepository;
import br.com.puc.listacompras.database.repository.UsuarioPatologiaRepository;
import br.com.puc.listacompras.dto.PatologiaResponseDTO;
import br.com.puc.listacompras.exception.model.ResourceNotFoundException;
import java.util.Collections;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class PatologiaService {

  private static final String PATOLOGIA_NAO_ENCONTRADA = "Patologia nao encontrada para o ID informado.";

  private final PatologiaRepository patologiaRepository;
  private final UsuarioPatologiaRepository usuarioPatologiaRepository;

  @Transactional(readOnly = true)
  public PatologiaResponseDTO buscarPorId(Long patologiaId) {
    Patologia patologia = patologiaRepository.findById(patologiaId)
        .orElseThrow(() -> new ResourceNotFoundException(PATOLOGIA_NAO_ENCONTRADA));
    return toResponseDTO(patologia);
  }

  @Transactional(readOnly = true)
  public List<PatologiaResponseDTO> listarPorUsuario(Long usuarioId) {
    List<Long> patologiaIds = usuarioPatologiaRepository.findPatologiaIdsByUsuarioId(usuarioId);
    if (patologiaIds == null || patologiaIds.isEmpty()) {
      return Collections.emptyList();
    }

    return patologiaRepository.findAllById(patologiaIds).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  private PatologiaResponseDTO toResponseDTO(Patologia patologia) {
    return new PatologiaResponseDTO(
        patologia.getId(),
        patologia.getNome(),
        patologia.getDescricao()
    );
  }
}
