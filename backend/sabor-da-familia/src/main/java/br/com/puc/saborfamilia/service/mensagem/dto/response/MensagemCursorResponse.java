package br.com.puc.saborfamilia.service.mensagem.dto.response;

import java.util.List;

public record MensagemCursorResponse(
  List<MensagemResponse> items,
  boolean hasMore,
  Long nextBefore
) {
}

