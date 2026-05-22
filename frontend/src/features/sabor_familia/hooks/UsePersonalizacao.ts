import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { personalizacaoService } from "../service/PersonalizacaoService";
import type { EditarPersonalizacaoRequest } from "../dto/personalizacao/request/EditarPersonalizacaoRequest";
import type { PersonalizacaoResponse } from "../dto/personalizacao/response/PersonalizacaoResponse";
import type { PersonalizacaoResumoResponse } from "../dto/personalizacao/response/PersonalizacaoResumoResponse";
import type { CategoriaPersonalizacaoResponse } from "../dto/personalizacao/response/CategoriaPersonalizacaoResponse";
import type { CatalogoPersonalizacaoResponse} from "../dto/personalizacao/response/CatalogoPersonalizacaoResponse";
function extrairStatusCode(err: unknown): number | undefined {
  return (err as { response?: { status: number } })?.response?.status;
}

export function useBuscarCategorias() {
  const [categorias, setCategorias] = useState<CategoriaPersonalizacaoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await personalizacaoService.buscarCategorias();
      setCategorias(data);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao carregar categorias.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { categorias, loading, error, recarregar: buscar };
}

export function useListarCatalogo() {
  const [catalogo, setCatalogo] = useState<CatalogoPersonalizacaoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await personalizacaoService.listarCatalogo();
      setCatalogo(data);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao carregar catálogo de personalização.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { catalogo, loading, error, recarregar: buscar };
}

export function useListarCatalogoContextoPerfil() {
  const [personalizacoes, setPersonalizacoes] = useState<PersonalizacaoResumoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await personalizacaoService.listarCatalogoContextoPerfil();
      setPersonalizacoes(data);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao carregar personalizações do perfil.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { personalizacoes, loading, error, recarregar: buscar };
}

export function useListarCatalogoContextoReceita() {
  const [personalizacoes, setPersonalizacoes] = useState<PersonalizacaoResumoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await personalizacaoService.listarCatalogoContextoReceita();
      setPersonalizacoes(data);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao carregar personalizações da receita.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { personalizacoes, loading, error, recarregar: buscar };
}

export function useEditarPersonalizacao() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const editar = async (
    codigo: string,
    request: EditarPersonalizacaoRequest,
    onSucesso?: (atualizada: PersonalizacaoResponse) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      const atualizada = await personalizacaoService.editarPersonalizacao(codigo, request);
      onSucesso?.(atualizada);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao editar personalização.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { editar, loading, error };
}

export function useAlternarStatusPersonalizacao() {
  const [loadingCodigo, setLoadingCodigo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const alternar = async (
    personalizacao: PersonalizacaoResponse,
    onSucesso?: (atualizada: PersonalizacaoResponse) => void
  ) => {
    setLoadingCodigo(personalizacao.codigo);
    setError(null);
    try {
      const ativa = personalizacao.status === "ATIVO";
      const atualizada = ativa
        ? await personalizacaoService.inativarPersonalizacao(personalizacao.codigo)
        : await personalizacaoService.ativarPersonalizacao(personalizacao.codigo);

      onSucesso?.(atualizada);
    } catch (err: unknown) {
      const statusCode = extrairStatusCode(err);
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao alterar status da personalização.");
      }
    } finally {
      setLoadingCodigo(null);
    }
  };

  return { alternar, loadingCodigo, error };
}
