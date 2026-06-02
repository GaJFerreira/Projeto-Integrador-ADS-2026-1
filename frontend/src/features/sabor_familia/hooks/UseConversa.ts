import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { conversaService } from "../service/ConversaService";
import { TEXTOS_INTERFACE } from "../utils/textosInterface";
import type { ConversaResponse } from "../dto/menssagem/response/ConversaResponse";
import type { MensagemResponse } from "../dto/menssagem/response/MensagemResponse";
import type { EnviarMensagemRequest } from "../dto/menssagem/request/EnviarMensagemRequest";
import type { EnviarMensagemResponse } from "../dto/menssagem/response/EnviarMensagemResponse";
import type { PageResponse } from "../dto/page/PageResponse";
import type { NovaMensagemEvent } from "../dto/menssagem/response/NovaMensagemEvent";

function extrairStatusCode(err: unknown): number | undefined {
  return (err as { response?: { status: number } })?.response?.status;
}

export function useBuscarConversas(usuarioId: number | null, page = 0, size = 20) {
  const [conversas, setConversas] = useState<PageResponse<ConversaResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async (): Promise<PageResponse<ConversaResponse> | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await conversaService.buscarConversas(page, size);
      setConversas(data);
      return data;
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError(TEXTOS_INTERFACE.erros.conversas);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [page, size, navigate]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  const aplicarNovaMensagem = useCallback(
    (event: NovaMensagemEvent, conversaAbertaId?: number) => {
      setConversas((prev) => {
        if (!prev) return prev;

        const indice = prev.content.findIndex((c) => c.id === event.conversaId);
        if (indice === -1) {
          queueMicrotask(() => {
            void buscar();
          });
          return prev;
        }

        const ehDestinatario =
          usuarioId != null &&
          event.mensagem.perfilDestinatario.usuarioId === usuarioId;

        const conversaAtualizada: ConversaResponse = {
          ...prev.content[indice],
          ultimaMensagem: event.mensagem.texto,
          dataUltimaMensagem: event.mensagem.dataEnvio,
          naoLidas:
            event.conversaId === conversaAbertaId
              ? 0
              : ehDestinatario
                ? prev.content[indice].naoLidas + 1
                : prev.content[indice].naoLidas,
        };

        const demais = prev.content.filter((_, i) => i !== indice);
        return {
          ...prev,
          content: [conversaAtualizada, ...demais],
        };
      });
    },
    [usuarioId, buscar]
  );

  const marcarConversaComoLidaLocal = useCallback((conversaId: number) => {
    setConversas((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        content: prev.content.map((conversa) =>
          conversa.id === conversaId ? { ...conversa, naoLidas: 0 } : conversa
        ),
      };
    });
  }, []);

  return {
    conversas,
    loading,
    error,
    recarregar: buscar,
    aplicarNovaMensagem,
    marcarConversaComoLidaLocal,
  };
}

export function useMensagensConversa(conversaId: number, limit = 20) {
  const [mensagens, setMensagens] = useState<MensagemResponse[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [loadingMais, setLoadingMais] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextBeforeRef = useRef<number | undefined>(undefined);
  const navigate = useNavigate();

  const carregarInicial = useCallback(async () => {
    setLoadingInicial(true);
    setError(null);
    try {
      const data = await conversaService.buscarMensagensConversa(conversaId, limit);

      setMensagens([...data.items].reverse());
      setHasMore(data.hasMore);
      nextBeforeRef.current = data.nextBefore ?? undefined;
      await conversaService.marcarConversaComoLida(conversaId);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError(TEXTOS_INTERFACE.erros.mensagens);
      }
    } finally {
      setLoadingInicial(false);
    }
  }, [conversaId, limit, navigate]);

  useEffect(() => {
    carregarInicial();
  }, [carregarInicial]);

  const carregarMais = useCallback(async () => {
    if (loadingMais || !hasMore || nextBeforeRef.current === undefined) return;

    setLoadingMais(true);
    setError(null);
    try {
      const data = await conversaService.buscarMensagensConversa(
        conversaId,
        limit,
        nextBeforeRef.current
      );

      setMensagens((prev) => [...[...data.items].reverse(), ...prev]);
      setHasMore(data.hasMore);
      nextBeforeRef.current = data.nextBefore ?? undefined;
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError(TEXTOS_INTERFACE.erros.mensagensAnteriores);
      }
    } finally {
      setLoadingMais(false);
    }
  }, [conversaId, limit, hasMore, loadingMais, navigate]);

  const adicionarMensagem = useCallback((mensagem: MensagemResponse) => {
    setMensagens((prev) => {
      if (prev.some((m) => m.id === mensagem.id)) return prev;
      return [...prev, mensagem];
    });
  }, []);

  return {
    mensagens,
    hasMore,
    loadingInicial,
    loadingMais,
    error,
    carregarMais,
    recarregar: carregarInicial,
    adicionarMensagem,
  };
}

export function useEnviarMensagem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const enviar = async (
    request: EnviarMensagemRequest,
    onSucesso?: (response: EnviarMensagemResponse) => void
  ) => {
    if (loading) return;

    setLoading(true);
    setError(null);
    try {
      const response = await conversaService.enviarMensagem(request);
      onSucesso?.(response);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError(TEXTOS_INTERFACE.erros.enviarMensagem);
      }
    } finally {
      setLoading(false);
    }
  };

  return { enviar, loading, error };
}
