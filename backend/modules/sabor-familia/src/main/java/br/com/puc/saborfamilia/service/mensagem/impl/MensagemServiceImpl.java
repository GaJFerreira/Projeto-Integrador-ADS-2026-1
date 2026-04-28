package br.com.puc.saborfamilia.service.mensagem.impl;

import br.com.puc.saborfamilia.database.entity.ConversaEntity;
import br.com.puc.saborfamilia.database.entity.MensagemEntity;
import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.repository.ConversaRepository;
import br.com.puc.saborfamilia.database.repository.MensagemRepository;
import br.com.puc.saborfamilia.database.repository.PerfilRepository;
import br.com.puc.saborfamilia.exception.model.ResourceNotFoundException;
import br.com.puc.saborfamilia.exception.model.ServiceException;
import br.com.puc.saborfamilia.service.mensagem.MensagemService;
import br.com.puc.saborfamilia.service.mensagem.dto.request.EnviarMensagemRequest;
import br.com.puc.saborfamilia.service.mensagem.dto.response.ConversaResponse;
import br.com.puc.saborfamilia.service.mensagem.dto.response.EnviarMensagemResponse;
import br.com.puc.saborfamilia.service.mensagem.dto.response.MensagemCursorResponse;
import br.com.puc.saborfamilia.service.mensagem.dto.response.MensagemResponse;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class MensagemServiceImpl implements MensagemService {

  private static final String PERFIL_NAO_ENCONTRADO = "Perfil não encontrado para o usuário informado.";
  private static final String DESTINATARIO_NAO_ENCONTRADO = "O perfil de destino da mensagem não foi encontrado.";
  private static final String CONVERSA_NAO_ENCONTRADA = "A conversa informada não foi encontrada.";
  private static final String USUARIO_NAO_PARTICIPANTE = "A conversa informada não foi encontrada.";
  private static final String IMPOSSIVEL_ENVIAR_MENSAGEM_PARA_SI = "Não é possível enviar mensagem para si mesmo.";

  private final MensagemRepository mensagemRepository;
  private final ConversaRepository conversaRepository;
  private final PerfilRepository perfilRepository;

  @Override
  @Transactional(readOnly = true)
  public Page<ConversaResponse> buscarConversas(Long usuarioId, Pageable pageable) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    Page<ConversaEntity> conversas = conversaRepository.findByParticipanteIdOrderByDataEnvioUltimaMensagemDesc(
      perfilUsuarioAutenticado.getId(),
      pageable
    );

    return conversas.map(conversa -> ConversaResponse.fromResponse(conversa, perfilUsuarioAutenticado.getId()));
  }

  @Override
  @Transactional
  public EnviarMensagemResponse enviarMensagem(Long usuarioId, EnviarMensagemRequest request) {
    if (usuarioId.equals(request.destinatarioId())) {
      throw new ServiceException(IMPOSSIVEL_ENVIAR_MENSAGEM_PARA_SI);
    }

    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    PerfilEntity destinatario = perfilRepository.findByUsuarioId(request.destinatarioId())
      .orElseThrow(() -> new ResourceNotFoundException(DESTINATARIO_NAO_ENCONTRADO));

    ConversaEntity conversa = recuperarConversa(perfilUsuarioAutenticado, destinatario);

    MensagemEntity mensagem = MensagemEntity.builder()
      .remetente(perfilUsuarioAutenticado)
      .destinatario(destinatario)
      .conversa(conversa)
      .texto(request.mensagem())
      .dataEnvio(LocalDateTime.now())
      .build();

    MensagemEntity mensagemSalva = mensagemRepository.save(mensagem);

    conversa.setDataEnvioUltimaMensagem(mensagemSalva.getDataEnvio());
    conversa.setConteudoUltimaMensagem(mensagemSalva.getTexto());
    conversaRepository.save(conversa);

    return new EnviarMensagemResponse(
      conversa.getId(),
      MensagemResponse.fromEntity(mensagemSalva)
    );
  }

  private ConversaEntity recuperarConversa(PerfilEntity remetente, PerfilEntity destinatario) {
    Long idMenor = Math.min(remetente.getId(), destinatario.getId());
    Long idMaior = Math.max(remetente.getId(), destinatario.getId());

    return conversaRepository.findByParticipantesConversa(idMenor, idMaior)
      .orElseGet(() -> {
        PerfilEntity primeiro = remetente.getId().equals(idMenor) ? remetente : destinatario;
        PerfilEntity segundo = remetente.getId().equals(idMaior) ? remetente : destinatario;

        ConversaEntity novaConversa = ConversaEntity.builder()
          .primeiroParticipante(primeiro)
          .segundoParticipante(segundo)
          .build();

        try {
          return conversaRepository.save(novaConversa);
        }
        catch (DataIntegrityViolationException ex) {
          return conversaRepository.findByParticipantesConversa(idMenor, idMaior)
            .orElseThrow(() -> ex);
        }
      });
  }

  @Override
  @Transactional(readOnly = true)
  public MensagemCursorResponse buscarMensagensConversa(Long usuarioId, Long conversaId, Integer limit, Long beforeId) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    ConversaEntity conversa = conversaRepository.findById(conversaId)
      .orElseThrow(() -> new ResourceNotFoundException(CONVERSA_NAO_ENCONTRADA));

    if (!conversa.getPrimeiroParticipante().getId().equals(perfilUsuarioAutenticado.getId())
      && !conversa.getSegundoParticipante().getId().equals(perfilUsuarioAutenticado.getId())) {
      throw new ServiceException(USUARIO_NAO_PARTICIPANTE);
    }

    int countMensagens = (limit == null || limit <= 0) ? 20 : limit;
    Sort ordenacao = Sort.by(Direction.DESC, "id");

    Pageable pageable = PageRequest.of(0, countMensagens, ordenacao);

    Page<MensagemEntity> page;

    if (beforeId == null) {
      page = mensagemRepository.findUltimasMensagens(conversaId, pageable);
    } else {
      page = mensagemRepository.findUltimasMensagensAnteriores(conversaId, beforeId, pageable);
    }

    List<MensagemResponse> mensagens = page.getContent().stream()
      .map(MensagemResponse::fromEntity)
      .toList();

    boolean possuiMaisPaginas = page.hasNext();

    Long idUltimaMensagem = possuiMaisPaginas && !mensagens.isEmpty()
      ? mensagens.stream()
        .mapToLong(MensagemResponse::id)
        .min()
        .orElseThrow()
      : null;

    return new MensagemCursorResponse(mensagens, possuiMaisPaginas, idUltimaMensagem);
  }

}
