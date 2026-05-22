import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { comentarioService } from "../service/ComentarioService";
import type { PerfilComentarioResponse } from "../dto/receita/response/PerfilComentarioResponse";

export function useBuscarComentarios(receitaId: number) {
  const [comentarios, setComentarios] = useState<PerfilComentarioResponse[]>([]);
  const [loading, setLoading] = useState(true);
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
        setError("Erro ao carregar comentários.");
      }
    } finally {
      setLoading(false);
    }
  }, [receitaId, navigate]);

  useEffect(() => {
    buscar();
  }, [buscar]);

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
      setError("O comentário não pode estar vazio.");
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
        fotoPerfilUrl: null,
        comentario: response.comentario,
        dataComentario: response.dataCadastro,
      };

      onSucesso?.(comentarioAdaptado);
    } catch (err: unknown) {
      const statusCode = (err as { response?: { status: number } })?.response?.status;
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao adicionar comentário.");
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

  const remover = async (
    comentarioId: number,
    onSucesso?: (comentarioId: number) => void
  ) => {
    setLoadingId(comentarioId);
    setError(null);

    try {
      await comentarioService.removerComentario(receitaId, comentarioId);
      onSucesso?.(comentarioId);
    } catch (err: unknown) {
      const statusCode = (err as { response?: { status: number } })?.response?.status;
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao remover comentário.");
      }
    } finally {
      setLoadingId(null);
    }
  };

  return { remover, loadingId, error };
}
