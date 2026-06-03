package br.com.puc.saborfamilia.service.mensagem.impl;

import br.com.puc.saborfamilia.database.entity.ConversaEntity;
import br.com.puc.saborfamilia.database.entity.MensagemEntity;
import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import br.com.puc.saborfamilia.database.repository.ConversaRepository;
import br.com.puc.saborfamilia.database.repository.MensagemRepository;
import br.com.puc.saborfamilia.database.repository.PerfilRepository;
import br.com.puc.saborfamilia.exception.model.ResourceNotFoundException;
import br.com.puc.saborfamilia.exception.model.ServiceException;
import br.com.puc.saborfamilia.enums.TipoEntidadeEnum;
import br.com.puc.saborfamilia.service.mensagem.MensagemService;
import br.com.puc.saborfamilia.service.mensagem.publisher.WebSocketPublisher;
import br.com.puc.saborfamilia.service.midia.MidiaService;
import br.com.puc.saborfamilia.service.perfil.dto.response.PerfilResumoResponse;
import br.com.puc.saborfamilia.service.mensagem.dto.request.EnviarMensagemRequest;
import br.com.puc.saborfamilia.service.mensagem.dto.response.ConversaResponse;
import br.com.puc.saborfamilia.service.mensagem.dto.response.EnviarMensagemResponse;
import br.com.puc.saborfamilia.service.mensagem.dto.response.MensagemCursorResponse;
import br.com.puc.saborfamilia.service.mensagem.dto.response.MensagemResponse;
import br.com.puc.saborfamilia.service.mensagem.dto.response.RemoverMensagemResponse;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Optional;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
  private static final String MENSAGEM_NAO_ENCONTRADA = "Mensagem não encontrada.";
  private static final String SEM_PERMISSAO_APAGAR_MENSAGEM =
    "Você só pode apagar mensagens que você enviou.";
  private static final String MENSAGEM_JA_APAGADA = "Esta mensagem já foi apagada.";
  public static final String PREVIEW_MENSAGEM_APAGADA = "Mensagem apagada";

  private final MensagemRepository mensagemRepository;
  private final ConversaRepository conversaRepository;
  private final PerfilRepository perfilRepository;
  private final MidiaService midiaService;
  private final WebSocketPublisher webSocketPublisher;

  @Override
  @Transactional(readOnly = true)
  public Page<ConversaResponse> buscarConversas(Long usuarioId, Pageable pageable) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    Page<ConversaEntity> conversas = conversaRepository.findByParticipanteIdOrderByDataEnvioUltimaMensagemDesc(
      perfilUsuarioAutenticado.getId(),
      pageable
    );

    List<ConversaEntity> conversasNaPagina = conversas.getContent();

    Set<Long> perfisComFoto = conversasNaPagina.isEmpty()
      ? Set.of()
      : midiaService.buscarEntidadeIdsComMidia(
        TipoEntidadeEnum.PERFIL,
        conversasNaPagina.stream()
          .map(c -> c.getOutroParticipante(perfilUsuarioAutenticado.getId()).getId())
          .distinct()
          .toList()
      );

    Map<Long, Long> naoLidasPorConversa = new HashMap<>();
    conversasNaPagina.forEach(conversa -> {
      long naoLidas = mensagemRepository.countNaoLidasPorConversa(
        conversa.getId(),
        perfilUsuarioAutenticado.getId()
      );
      naoLidasPorConversa.put(conversa.getId(), naoLidas);
    });

    return conversas.map(conversa -> {
      PerfilEntity contato = conversa.getOutroParticipante(perfilUsuarioAutenticado.getId());
      return new ConversaResponse(
        conversa.getId(),
        toPerfilResumoResponse(contato, perfisComFoto),
        conversa.getConteudoUltimaMensagem(),
        conversa.getDataEnvioUltimaMensagem(),
        naoLidasPorConversa.getOrDefault(conversa.getId(), 0L)
      );
    });
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
      .lida(false)
      .build();

    MensagemEntity mensagemSalva = mensagemRepository.save(mensagem);

    conversa.setDataEnvioUltimaMensagem(mensagemSalva.getDataEnvio());
    conversa.setConteudoUltimaMensagem(mensagemSalva.getTexto());
    conversaRepository.save(conversa);

    Set<Long> perfisComFoto = midiaService.buscarEntidadeIdsComMidia(
      TipoEntidadeEnum.PERFIL,
      List.of(perfilUsuarioAutenticado.getId(), destinatario.getId())
    );

    MensagemResponse mensagemResponse = toMensagemResponse(mensagemSalva, perfisComFoto);

    webSocketPublisher.enviarEventoMensagem(
      conversa.getId(),
      mensagemResponse,
      perfilUsuarioAutenticado.getUsuarioId(),
      destinatario.getUsuarioId()
    );

    return new EnviarMensagemResponse(conversa.getId(), mensagemResponse);
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

    List<MensagemEntity> content = page.getContent();

    Set<Long> perfilIds = new HashSet<>();
    content.forEach(mensagem -> {
      perfilIds.add(mensagem.getRemetente().getId());
      perfilIds.add(mensagem.getDestinatario().getId());
    });

    Set<Long> perfisComFoto = perfilIds.isEmpty()
      ? Set.of()
      : midiaService.buscarEntidadeIdsComMidia(TipoEntidadeEnum.PERFIL, perfilIds);

    List<MensagemResponse> mensagens = content.stream()
      .map(mensagem -> toMensagemResponse(mensagem, perfisComFoto))
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

  @Override
  @Transactional
  public void marcarConversaComoLida(Long usuarioId, Long conversaId) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    ConversaEntity conversa = conversaRepository.findById(conversaId)
      .orElseThrow(() -> new ResourceNotFoundException(CONVERSA_NAO_ENCONTRADA));

    if (!conversa.getPrimeiroParticipante().getId().equals(perfilUsuarioAutenticado.getId())
      && !conversa.getSegundoParticipante().getId().equals(perfilUsuarioAutenticado.getId())) {
      throw new ServiceException(USUARIO_NAO_PARTICIPANTE);
    }

    mensagemRepository.marcarConversaComoLida(conversaId, perfilUsuarioAutenticado.getId());
  }

  @Override
  @Transactional
  public RemoverMensagemResponse removerMensagem(Long usuarioId, Long mensagemId) {
    PerfilEntity perfilUsuarioAutenticado = perfilRepository.findByUsuarioId(usuarioId)
      .orElseThrow(() -> new ResourceNotFoundException(PERFIL_NAO_ENCONTRADO));

    MensagemEntity mensagem = mensagemRepository.findByIdComRelacionamentos(mensagemId)
      .orElseThrow(() -> new ResourceNotFoundException(MENSAGEM_NAO_ENCONTRADA));

    if (!mensagem.getRemetente().getId().equals(perfilUsuarioAutenticado.getId())) {
      throw new ServiceException(SEM_PERMISSAO_APAGAR_MENSAGEM);
    }

    if (mensagem.getApagada()) {
      throw new ServiceException(MENSAGEM_JA_APAGADA);
    }

    ConversaEntity conversa = mensagem.getConversa();

    if (!conversa.getPrimeiroParticipante().getId().equals(perfilUsuarioAutenticado.getId())
      && !conversa.getSegundoParticipante().getId().equals(perfilUsuarioAutenticado.getId())) {
      throw new ServiceException(USUARIO_NAO_PARTICIPANTE);
    }

    mensagem.setApagada(true);
    mensagem.setDataApagada(LocalDateTime.now());
    mensagemRepository.save(mensagem);

    atualizarConversa(conversa);
    conversaRepository.save(conversa);

    Set<Long> perfisComFoto = midiaService.buscarEntidadeIdsComMidia(
      TipoEntidadeEnum.PERFIL,
      List.of(mensagem.getRemetente().getId(), mensagem.getDestinatario().getId())
    );

    MensagemResponse mensagemResponse = toMensagemResponse(mensagem, perfisComFoto);

    long naoLidasRemetente = mensagemRepository.countNaoLidasPorConversa(
      conversa.getId(),
      mensagem.getRemetente().getId()
    );
    long naoLidasDestinatario = mensagemRepository.countNaoLidasPorConversa(
      conversa.getId(),
      mensagem.getDestinatario().getId()
    );

    webSocketPublisher.enviarEventoMensagemApagada(
      conversa.getId(),
      mensagemResponse,
      conversa.getConteudoUltimaMensagem(),
      conversa.getDataEnvioUltimaMensagem(),
      naoLidasRemetente,
      naoLidasDestinatario,
      mensagem.getRemetente().getUsuarioId(),
      mensagem.getDestinatario().getUsuarioId()
    );

    return new RemoverMensagemResponse(
      conversa.getId(),
      mensagemResponse,
      conversa.getConteudoUltimaMensagem(),
      conversa.getDataEnvioUltimaMensagem(),
      naoLidasRemetente
    );
  }

  private void atualizarConversa(ConversaEntity conversa) {
    Optional<MensagemEntity> ultimaMensagemPreview = mensagemRepository
      .findFirstByConversaIdAndApagadaFalseOrderByIdDesc(conversa.getId());

    if (ultimaMensagemPreview.isPresent()) {
      MensagemEntity mensagem = ultimaMensagemPreview.get();
      conversa.setConteudoUltimaMensagem(mensagem.getTexto());
      conversa.setDataEnvioUltimaMensagem(mensagem.getDataEnvio());
      return;
    }

    Optional<MensagemEntity> ultimaMensagemQualquer = mensagemRepository
      .findFirstByConversaIdOrderByIdDesc(conversa.getId());

    if (ultimaMensagemQualquer.isEmpty()) {
      conversa.setConteudoUltimaMensagem(null);
      conversa.setDataEnvioUltimaMensagem(null);
      return;
    }

    MensagemEntity ultimaMensagem = ultimaMensagemQualquer.get();

    LocalDateTime dataEnvioUltimaMensagem = ultimaMensagem.getDataApagada() != null
      ? ultimaMensagem.getDataApagada()
      : ultimaMensagem.getDataEnvio();

    conversa.setConteudoUltimaMensagem(PREVIEW_MENSAGEM_APAGADA);
    conversa.setDataEnvioUltimaMensagem(dataEnvioUltimaMensagem);
  }

  private MensagemResponse toMensagemResponse(MensagemEntity mensagem, Set<Long> perfisComFoto) {
    boolean apagada = Boolean.TRUE.equals(mensagem.getApagada());

    return new MensagemResponse(
      mensagem.getId(),
      toPerfilResumoResponse(mensagem.getRemetente(), perfisComFoto),
      toPerfilResumoResponse(mensagem.getDestinatario(), perfisComFoto),
      apagada ? null : mensagem.getTexto(),
      mensagem.getDataEnvio(),
      apagada
    );
  }

  private PerfilResumoResponse toPerfilResumoResponse(PerfilEntity perfil, Set<Long> perfisComFoto) {
    return PerfilResumoResponse.fromEntity(
      perfil,
      perfisComFoto.contains(perfil.getId()),
      null
    );
  }

}
