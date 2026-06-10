import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { comentarioService } from "../service/ComentarioService";
import { TEXTOS_INTERFACE } from "../utils/textosInterface";
import type { PerfilComentarioResponse } from "../dto/receita/response/PerfilComentarioResponse";

const DURACAO_FEEDBACK_MS = 5000;

export function useBuscarComentarios(receitaId: number, enabled = true) {
  const [comentarios, setComentarios] = useState<PerfilComentarioResponse[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await comentarioService.buscarComentarios(receitaId);
      setComentarios(data);
    } catch (err: unknown) {
      const statusCode = (err as { response?: { status: number } })?.response?.status;
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError(TEXTOS_INTERFACE.erros.comentarios);
      }
    } finally {
      setLoading(false);
    }
  }, [receitaId, navigate]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    buscar();
  }, [buscar, enabled]);

  return { comentarios, loading, error, recarregar: buscar };
}

export function useAdicionarComentario(receitaId: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const adicionar = async (
    texto: string,
    onSucesso?: (novoComentario: PerfilComentarioResponse) => void
  ) => {
    if (!texto.trim()) {
      setError(TEXTOS_INTERFACE.erros.comentarioVazio);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await comentarioService.adicionarComentario(receitaId, {
        comentario: texto,
      });

      const comentarioAdaptado: PerfilComentarioResponse = {
        id: response.id,
        perfilId: response.usuarioId,
        nomePerfil: response.nomeAutor,
        possuiMidia: false,
        comentario: response.comentario,
        dataComentario: response.dataCadastro,
      };

      onSucesso?.(comentarioAdaptado);
    } catch (err: unknown) {
      const statusCode = (err as { response?: { status: number } })?.response?.status;
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError(TEXTOS_INTERFACE.erros.adicionarComentario);
      }
    } finally {
      setLoading(false);
    }
  };

  return { adicionar, loading, error };
}

export function useRemoverComentario(receitaId: number) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const remover = async (
    comentarioId: number,
    onSucesso?: (comentarioId: number) => void
  ) => {
    setLoadingId(comentarioId);
    setError(null);

    try {
      await comentarioService.removerComentario(receitaId, comentarioId);
      enqueueSnackbar(TEXTOS_INTERFACE.sucesso.comentarioRemovido, {
        variant: "success",
        autoHideDuration: DURACAO_FEEDBACK_MS,
      });
      onSucesso?.(comentarioId);
    } catch (err: unknown) {
      const statusCode = (err as { response?: { status: number } })?.response?.status;
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError(TEXTOS_INTERFACE.erros.removerComentario);
      }
    } finally {
      setLoadingId(null);
    }
  };

  return { remover, loadingId, error };
}
