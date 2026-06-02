package br.com.puc.saborfamilia.service.mensagem;

import br.com.puc.saborfamilia.service.mensagem.dto.request.EnviarMensagemRequest;
import br.com.puc.saborfamilia.service.mensagem.dto.response.ConversaResponse;
import br.com.puc.saborfamilia.service.mensagem.dto.response.EnviarMensagemResponse;
import br.com.puc.saborfamilia.service.mensagem.dto.response.MensagemCursorResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MensagemService {

  Page<ConversaResponse> buscarConversas(Long usuarioId, Pageable pageable);

  EnviarMensagemResponse enviarMensagem(Long usuarioId, EnviarMensagemRequest request);

  MensagemCursorResponse buscarMensagensConversa(Long usuarioId, Long conversaId, Integer limit, Long beforeId);

  void marcarConversaComoLida(Long usuarioId, Long conversaId);

}

