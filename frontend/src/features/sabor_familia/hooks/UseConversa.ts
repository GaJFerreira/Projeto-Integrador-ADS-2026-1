import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { conversaService } from "../service/ConversaService";
import type { ConversaResponse } from "../dto/menssagem/response/ConversaResponse";
import type { MensagemResponse } from "../dto/menssagem/response/MensagemResponse";
import type { EnviarMensagemRequest } from "../dto/menssagem/request/EnviarMensagemRequest";
import type { PageResponse } from "../dto/page/PageResponse";

function extrairStatusCode(err: unknown): number | undefined {
  return (err as { response?: { status: number } })?.response?.status;
}

export function useBuscarConversas(page = 0, size = 20) {
  const [conversas, setConversas] = useState<PageResponse<ConversaResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await conversaService.buscarConversas(page, size);
      setConversas(data);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao carregar conversas.");
      }
    } finally {
      setLoading(false);
    }
  }, [page, size, navigate]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { conversas, loading, error, recarregar: buscar };
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
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao carregar mensagens.");
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
        setError("Erro ao carregar mensagens anteriores.");
      }
    } finally {
      setLoadingMais(false);
    }
  }, [conversaId, limit, hasMore, loadingMais, navigate]);

  return {
    mensagens,
    hasMore,
    loadingInicial,
    loadingMais,
    error,
    carregarMais,
    recarregar: carregarInicial,
  };
}

export function useEnviarMensagem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const enviar = async (
    request: EnviarMensagemRequest,
    onSucesso?: (novaMensagem: MensagemResponse) => void
  ) => {
    if (loading) return;

    setLoading(true);
    setError(null);
    try {
      const response = await conversaService.enviarMensagem(request);
      onSucesso?.(response.mensagem);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao enviar mensagem.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { enviar, loading, error };
}
