import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { receitaService } from "../service/ReceitaService";
import type { ReceitaRequest } from "../dto/receita/request/ReceitaRequest";
import type { ReceitaResponse } from "../dto/receita/response/ReceitaResponse";
import type { ReceitaResumoResponse } from "../dto/receita/response/ReceitaResumoResponse";
import type { PageResponse } from "../dto/page/PageResponse";

function extrairStatusCode(err: unknown): number | undefined {
  return (err as { response?: { status: number } })?.response?.status;
}

export function useFeedPersonalizado(page = 0, size = 20) {
  const [feed, setFeed] = useState<PageResponse<ReceitaResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await receitaService.feedPersonalizado(page, size);
      setFeed(data);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) navigate("/sabor-familia/error", { state: { statusCode } });
      else setError("Erro ao carregar o feed.");
    } finally {
      setLoading(false);
    }
  }, [page, size, navigate]);

  useEffect(() => { buscar(); }, [buscar]);

  return { feed, loading, error, recarregar: buscar };
}

export function useExplorarReceitas(
  page = 0,
  size = 20,
  titulo?: string,
  tipoRefeicao?: string
) {
  const [receitas, setReceitas] = useState<PageResponse<ReceitaResumoResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await receitaService.explorarReceitas(page, size, titulo, tipoRefeicao);
      setReceitas(data);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) navigate("/sabor-familia/error", { state: { statusCode } });
      else setError("Erro ao explorar receitas.");
    } finally {
      setLoading(false);
    }
  }, [page, size, titulo, tipoRefeicao, navigate]);

  useEffect(() => { buscar(); }, [buscar]);

  return { receitas, loading, error, recarregar: buscar };
}

export function useBuscarReceitasPerfil(perfilId: number, page = 0, size = 20) {
  const [receitas, setReceitas] = useState<PageResponse<ReceitaResumoResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await receitaService.buscarReceitasPerfil(perfilId, page, size);
      setReceitas(data);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) navigate("/sabor-familia/error", { state: { statusCode } });
      else setError("Erro ao buscar receitas do perfil.");
    } finally {
      setLoading(false);
    }
  }, [perfilId, page, size, navigate]);

  useEffect(() => { buscar(); }, [buscar]);

  return { receitas, loading, error, recarregar: buscar };
}

export function useBuscarReceita(receitaId: number) {
  const [receita, setReceita] = useState<ReceitaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await receitaService.buscarReceita(receitaId);
      setReceita(data);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) navigate("/sabor-familia/error", { state: { statusCode } });
      else setError("Erro ao buscar receita.");
    } finally {
      setLoading(false);
    }
  }, [receitaId, navigate]);

  useEffect(() => { buscar(); }, [buscar]);

  return { receita, loading, error, recarregar: buscar };
}

export function useBuscarReceitasFavoritas(page = 0, size = 20) {
  const [favoritas, setFavoritas] = useState<PageResponse<ReceitaResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await receitaService.buscarReceitasFavoritas(page, size);
      setFavoritas(data);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) navigate("/sabor-familia/error", { state: { statusCode } });
      else setError("Erro ao buscar receitas favoritas.");
    } finally {
      setLoading(false);
    }
  }, [page, size, navigate]);

  useEffect(() => { buscar(); }, [buscar]);

  return { favoritas, loading, error, recarregar: buscar };
}

export function useCriarReceita() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const criar = async (
    request: ReceitaRequest,
    onSucesso?: (receita: ReceitaResponse) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      const receita = await receitaService.criarReceita(request);
      onSucesso?.(receita);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) navigate("/sabor-familia/error", { state: { statusCode } });
      else setError("Erro ao criar receita.");
    } finally {
      setLoading(false);
    }
  };

  return { criar, loading, error };
}

export function useEditarReceita() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const editar = async (
    receitaId: number,
    request: ReceitaRequest,
    onSucesso?: (receita: ReceitaResponse) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      const receita = await receitaService.editarReceita(receitaId, request);
      onSucesso?.(receita);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) navigate("/sabor-familia/error", { state: { statusCode } });
      else setError("Erro ao editar receita.");
    } finally {
      setLoading(false);
    }
  };

  return { editar, loading, error };
}

export function useRemoverReceita() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const remover = async (
    receitaId: number,
    onSucesso?: (id: number) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      await receitaService.removerReceita(receitaId);
      onSucesso?.(receitaId);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) navigate("/sabor-familia/error", { state: { statusCode } });
      else setError("Erro ao remover receita.");
    } finally {
      setLoading(false);
    }
  };

  return { remover, loading, error };
}
