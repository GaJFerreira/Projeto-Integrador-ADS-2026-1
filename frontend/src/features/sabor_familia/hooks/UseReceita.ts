import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { receitaService } from "../service/ReceitaService";
import { invalidarMidia } from "../lib/midiaCache";
import { extrairErroApi } from "../utils/extrairErroApi";
import { TEXTOS_INTERFACE } from "../utils/textosInterface";
import {
  tratarErroListagem,
  tratarErroNavegacao,
} from "../utils/tratarErroRequisicao";
import type { ReceitaRequest } from "../dto/receita/request/ReceitaRequest";
import type { ReceitaResponse } from "../dto/receita/response/ReceitaResponse";
import type { ReceitaResumoResponse } from "../dto/receita/response/ReceitaResumoResponse";
import type { PageResponse } from "../dto/page/PageResponse";

const DURACAO_FEEDBACK_MS = 5000;

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
      tratarErroListagem(err, setError, navigate, "feed");
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
  tipoRefeicao?: string,
  enabled = true
) {
  const [receitas, setReceitas] = useState<PageResponse<ReceitaResumoResponse> | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await receitaService.explorarReceitas(page, size, titulo, tipoRefeicao);
      setReceitas(data);
    } catch (err: unknown) {
      tratarErroListagem(err, setError, navigate, "explorar");
    } finally {
      setLoading(false);
    }
  }, [page, size, titulo, tipoRefeicao, navigate]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    buscar();
  }, [buscar, enabled]);

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
      tratarErroListagem(err, setError, navigate, "perfil");
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
      tratarErroListagem(err, setError, navigate, "receita");
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
      tratarErroListagem(err, setError, navigate, "favoritos");
    } finally {
      setLoading(false);
    }
  }, [page, size, navigate]);

  useEffect(() => { buscar(); }, [buscar]);

  return { favoritas, loading, error, recarregar: buscar };
}

export function useCriarReceita() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const limparErro = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const criar = async (
    request: ReceitaRequest,
    arquivo?: File | null,
    onSucesso?: (receita: ReceitaResponse) => void
  ) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const receita = await receitaService.criarReceita(request, arquivo);
      if (arquivo) {
        invalidarMidia("receita", receita.id);
      }
      enqueueSnackbar(TEXTOS_INTERFACE.sucesso.receitaPublicada, {
        variant: "success",
        autoHideDuration: DURACAO_FEEDBACK_MS,
      });
      onSucesso?.(receita);
    } catch (err: unknown) {
      const { mensagem, errosCampo } = extrairErroApi(err);
      setError(mensagem);
      setFieldErrors(errosCampo);
    } finally {
      setLoading(false);
    }
  };

  return { criar, loading, error, fieldErrors, limparErro };
}

export function useEditarReceita() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const limparErro = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const editar = async (
    receitaId: number,
    request: ReceitaRequest,
    arquivo?: File | null,
    onSucesso?: (receita: ReceitaResponse) => void
  ) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const receita = await receitaService.editarReceita(receitaId, request, arquivo);
      if (arquivo) {
        invalidarMidia("receita", receita.id);
      }
      enqueueSnackbar(TEXTOS_INTERFACE.sucesso.receitaAtualizada, {
        variant: "success",
        autoHideDuration: DURACAO_FEEDBACK_MS,
      });
      onSucesso?.(receita);
    } catch (err: unknown) {
      const { mensagem, errosCampo } = extrairErroApi(err);
      setError(mensagem);
      setFieldErrors(errosCampo);
    } finally {
      setLoading(false);
    }
  };

  return { editar, loading, error, fieldErrors, limparErro };
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
      invalidarMidia("receita", receitaId);
      onSucesso?.(receitaId);
    } catch (err: unknown) {
      tratarErroNavegacao(err, navigate, "receita");
    } finally {
      setLoading(false);
    }
  };

  return { remover, loading, error };
}
