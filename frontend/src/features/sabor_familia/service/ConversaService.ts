import api from "../lib/Api";
import type { EnviarMensagemRequest } from "../dto/menssagem/request/EnviarMensagemRequest";
import type { ConversaResponse } from "../dto/menssagem/response/ConversaResponse";
import type { EnviarMensagemResponse } from "../dto/menssagem/response/EnviarMensagemResponse";
import type { MensagemCursorResponse } from "../dto/menssagem/response/MensagemCursorResponse";
import type { RemoverMensagemResponse } from "../dto/menssagem/response/RemoverMensagemResponse";
import type { PageResponse } from "../dto/page/PageResponse";

export const conversaService = {
  buscarConversas: async (
    page = 0,
    size = 20
  ): Promise<PageResponse<ConversaResponse>> => {
    const { data } = await api.get<PageResponse<ConversaResponse>>("/conversa", {
      params: { page, size, sort: "dataEnvioUltimaMensagem,desc" },
    });
    return data;
  },

  buscarMensagensConversa: async (
    conversaId: number,
    limit = 20,
    before?: number
  ): Promise<MensagemCursorResponse> => {
    const { data } = await api.get<MensagemCursorResponse>(
      `/conversa/${conversaId}/mensagens`,
      { params: { limit, ...(before !== undefined && { before }) } }
    );
    return data;
  },

  marcarConversaComoLida: async (conversaId: number): Promise<void> => {
    await api.patch(`/conversa/${conversaId}/marcar-lida`);
  },

  enviarMensagem: async (
    request: EnviarMensagemRequest
  ): Promise<EnviarMensagemResponse> => {
    const { data } = await api.post<EnviarMensagemResponse>(
      "/conversa/mensagens",
      request
    );
    return data;
  },

  removerMensagem: async (mensagemId: number): Promise<RemoverMensagemResponse> => {
    const { data } = await api.delete<RemoverMensagemResponse>(
      `/conversa/mensagens/${mensagemId}`
    );
    return data;
  },
};
