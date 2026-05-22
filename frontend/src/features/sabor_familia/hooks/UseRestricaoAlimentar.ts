import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { restricaoAlimentarService } from "../service/RestricaoalimentarService";
import type { RestricaoAlimentarResponse } from "../dto/restricao/response/RestricaoAlimentarResponse";
import type { EditarRestricaoAlimentarRequest } from "../dto/restricao/request/EditarRestricaoAlimentarRequest";

function extrairStatusCode(err: unknown): number | undefined {
  return (err as { response?: { status: number } })?.response?.status;
}

export function useBuscarRestricoesAlimentares() {
  const [restricoes, setRestricoes] = useState<RestricaoAlimentarResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await restricaoAlimentarService.buscarRestricoesAlimentares();
      setRestricoes(data);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao carregar restrições alimentares.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { restricoes, loading, error, recarregar: buscar };
}

export function useBuscarRestricaoAlimentar(codigo: string) {
  const [restricao, setRestricao] = useState<RestricaoAlimentarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    if (!codigo) return;

    setLoading(true);
    setError(null);
    try {
      const data = await restricaoAlimentarService.buscarRestricaoAlimentar(codigo);
      setRestricao(data);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao carregar restrição alimentar.");
      }
    } finally {
      setLoading(false);
    }
  }, [codigo, navigate]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { restricao, loading, error };
}

export function useEditarRestricaoAlimentar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const editar = async (
    codigo: string,
    request: EditarRestricaoAlimentarRequest,
    onSucesso?: (atualizada: RestricaoAlimentarResponse) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      const atualizada = await restricaoAlimentarService.editarRestricaoAlimentar(codigo, request);
      onSucesso?.(atualizada);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao editar restrição alimentar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { editar, loading, error };
}

export function useAlternarStatusRestricao() {
  const [loadingCodigo, setLoadingCodigo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const alternar = async (
    restricao: RestricaoAlimentarResponse,
    onSucesso?: (atualizada: RestricaoAlimentarResponse) => void
  ) => {
    setLoadingCodigo(restricao.codigo);
    setError(null);
    try {
      const ativa = restricao.status === "ATIVO";
      const atualizada = ativa
        ? await restricaoAlimentarService.inativarRestricaoAlimentar(restricao.codigo)
        : await restricaoAlimentarService.ativarRestricaoAlimentar(restricao.codigo);

      onSucesso?.(atualizada);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao alterar status da restrição alimentar.");
      }
    } finally {
      setLoadingCodigo(null);
    }
  };

  return { alternar, loadingCodigo, error };
}
