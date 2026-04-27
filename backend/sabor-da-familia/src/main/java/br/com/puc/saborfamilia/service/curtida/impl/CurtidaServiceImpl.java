package br.com.puc.saborfamilia.service.curtida.impl;

import br.com.puc.saborfamilia.database.entity.CurtidaReceitaEntity;
import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.entity.ReceitaEntity;
import br.com.puc.saborfamilia.database.repository.CurtidaReceitaRepository;
import br.com.puc.saborfamilia.database.repository.PerfilRepository;
import br.com.puc.saborfamilia.database.repository.ReceitaRepository;
import br.com.puc.saborfamilia.exception.model.ResourceNotFoundException;
import br.com.puc.saborfamilia.service.curtida.CurtidaService;
import br.com.puc.saborfamilia.service.curtida.dto.CurtidaResponse;
import br.com.puc.saborfamilia.service.receita.dto.response.PerfilCurtidaResponse;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class CurtidaServiceImpl implements CurtidaService {

  private static final String PERFIL_NAO_ENCONTRADO = "Perfil não encontrado para o usuário informado.";
  private static final String RECEITA_NAO_ENCONTRADA = "Receita não encontrada para o ID informado.";

  private final CurtidaReceitaRepository curtidaReceitaRepository;
  private final PerfilRepository perfilRepository;
  private final ReceitaRepository receitaRepository;

  @Override
  @Transactional(readOnly = true)
  public List<PerfilCurtidaResponse> buscarPerfilCurtidasReceita(Long receitaId) {
    receitaRepository.findById(receitaId)
      .orElseThrow(() -> new ResourceNotFoundException(RECEITA_NAO_ENCONTRADA));

    return curtidaReceitaRepository.findByReceitaIdWithPerfil(receitaId).stream()
      .map(PerfilCurtidaResponse::fromEntity)
      .toList();
  }

  @Override
  @Transactional
  public CurtidaResponse adicionarCurtidaReceita(Long usuarioId, Long receitaId) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    ReceitaEntity receita = receitaRepository.findById(receitaId)
      .orElseThrow(() -> new ResourceNotFoundException(RECEITA_NAO_ENCONTRADA));

    boolean receitaCurtida = curtidaReceitaRepository
      .findByReceitaIdAndPerfilId(receitaId, perfilUsuarioAutenticado.getId())
      .isPresent();

    if (receitaCurtida) {
      return new CurtidaResponse(receitaId, false, "Usuário já havia curtido esta receita.");
    }

    CurtidaReceitaEntity curtida = CurtidaReceitaEntity.builder()
      .receita(receita)
      .perfil(perfilUsuarioAutenticado)
      .dataCadastro(LocalDateTime.now())
      .build();

    try {
      curtidaReceitaRepository.save(curtida);
    }
    catch (DataIntegrityViolationException ex) {
      return new CurtidaResponse(receitaId, false, "Usuário já havia curtido esta receita.");
    }

    receitaRepository.aumentarContadorCurtidas(receita.getId());

    return new CurtidaResponse(receitaId, true, "Curtida registrada.");
  }

  @Override
  @Transactional
  public CurtidaResponse removerCurtidaReceita(Long usuarioId, Long receitaId) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    ReceitaEntity receita = receitaRepository.findById(receitaId)
      .orElseThrow(() -> new ResourceNotFoundException(RECEITA_NAO_ENCONTRADA));

    boolean removido = curtidaReceitaRepository.findByReceitaIdAndPerfilId(receita.getId(), perfilUsuarioAutenticado.getId())
      .map(curtida -> {
        curtidaReceitaRepository.delete(curtida);
        receitaRepository.reduzirContadorCurtidas(receita.getId());
        return true;
      })
      .orElse(false);

    String motivo = removido ? "Curtida removida." : "Não havia curtida para remover.";
    return new CurtidaResponse(receitaId, false, motivo);
  }

}

