import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { useAuth } from "./UseAuth";
import { perfilService } from "../service/PerfilService";
import type { PerfilRequest } from "../dto/perfil/request/PerfilRequest";
import type { EditarPerfilRequest } from "../dto/perfil/request/EditarPerfilRequest";
import type { PerfilResponse } from "../dto/perfil/response/PerfilResponse";
import type { PerfilResumoResponse } from "../dto/perfil/response/PerfilResumoResponse";
import type { PageResponse } from "../dto/page/PageResponse";

interface ApiError {
  response?: { status: number };
}

function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as ApiError).response?.status === "number"
  );
}

export function useBuscarMeuPerfil() {
  const { salvarPerfil } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await perfilService.buscarMeuPerfil();
      salvarPerfil(data);
      return data;
    } catch (err: unknown) {
      if (isApiError(err)) {
        navigate("/sabor-familia/error", { state: { statusCode: err.response?.status }, replace: true });
      } else {
        setError("Erro ao buscar perfil.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [navigate, salvarPerfil]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { loading, error, recarregar: buscar };
}

export function useBuscarPerfil(perfilId: number) {
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await perfilService.buscarPerfilPublico(perfilId);
      setPerfil(data);
    } catch (err: unknown) {
      if (isApiError(err)) {
        navigate("/sabor-familia/error", { state: { statusCode: err.response?.status }, replace: true });
      } else {
        setError("Erro ao buscar perfil.");
      }
    } finally {
      setLoading(false);
    }
  }, [perfilId, navigate]);

  useEffect(() => {
    buscar();
  }, [buscar, location.pathname, navigationType]);

  return { perfil, loading, error, recarregar: buscar };
}

export function useCriarPerfil() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const criar = async (
    request: PerfilRequest,
    onSucesso?: (perfil: PerfilResponse) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      const perfil = await perfilService.criarPerfil(request);
      onSucesso?.(perfil);
    } catch (err: unknown) {
      if (isApiError(err)) {
        navigate("/sabor-familia/error", { state: { statusCode: err.response?.status }, replace: true });
      } else {
        setError("Erro ao criar perfil.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { criar, loading, error };
}

export function useEditarPerfil() {
  const { salvarPerfil } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const editar = async (
    request: EditarPerfilRequest,
    onSucesso?: (perfil: PerfilResponse) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      const perfil = await perfilService.editarPerfil(request);
      salvarPerfil(perfil);
      onSucesso?.(perfil);
    } catch (err: unknown) {
      if (isApiError(err)) {
        navigate("/sabor-familia/error", { state: { statusCode: err.response?.status }, replace: true });
      } else {
        setError("Erro ao editar perfil.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { editar, loading, error };
}

export function useBuscarSeguidores(perfilId: number, page = 0, size = 20) {
  const [seguidores, setSeguidores] = useState<PageResponse<PerfilResumoResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSeguidores(null);
    setError(null);
  }, [perfilId]);

  useEffect(() => {
    let cancelled = false;

    const buscar = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await perfilService.buscarSeguidores(perfilId, page, size);
        if (!cancelled) {
          setSeguidores(data);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        if (isApiError(err)) {
          navigate("/sabor-familia/error", { state: { statusCode: err.response?.status }, replace: true });
        } else {
          setError("Erro ao buscar seguidores.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    buscar();
    return () => {
      cancelled = true;
    };
  }, [perfilId, page, size, navigate]);

  const recarregar = useCallback(async () => {
    const data = await perfilService.buscarSeguidores(perfilId, page, size);
    setSeguidores(data);
  }, [perfilId, page, size]);

  return { seguidores, loading, error, recarregar };
}

export function useBuscarSeguindo(perfilId: number, page = 0, size = 20) {
  const [seguindo, setSeguindo] = useState<PageResponse<PerfilResumoResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSeguindo(null);
    setError(null);
  }, [perfilId]);

  useEffect(() => {
    let cancelled = false;

    const buscar = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await perfilService.buscarSeguindo(perfilId, page, size);
        if (!cancelled) {
          setSeguindo(data);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        if (isApiError(err)) {
          navigate("/sabor-familia/error", { state: { statusCode: err.response?.status }, replace: true });
        } else {
          setError("Erro ao buscar seguindo.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    buscar();
    return () => {
      cancelled = true;
    };
  }, [perfilId, page, size, navigate]);

  const recarregar = useCallback(async () => {
    const data = await perfilService.buscarSeguindo(perfilId, page, size);
    setSeguindo(data);
  }, [perfilId, page, size]);

  return { seguindo, loading, error, recarregar };
}

export function useAlternarSeguir(
  perfilId: number,
  seguindoInicial: boolean,
  totalSeguidoresInicial: number
) {
  const [seguindo, setSeguindo] = useState(seguindoInicial);
  const [totalSeguidores, setTotalSeguidores] = useState(totalSeguidoresInicial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSeguindo(seguindoInicial);
    setTotalSeguidores(totalSeguidoresInicial);
  }, [perfilId, seguindoInicial, totalSeguidoresInicial]);

  const alternar = async () => {
    if (loading) return;

    const novoEstado = !seguindo;
    setSeguindo(novoEstado);
    setTotalSeguidores((prev) => (novoEstado ? prev + 1 : prev - 1));
    setLoading(true);
    setError(null);

    try {
      if (novoEstado) {
        await perfilService.seguirPerfil(perfilId);
      } else {
        await perfilService.deixarSeguirPerfil(perfilId);
      }
    } catch (err: unknown) {
      setSeguindo(seguindoInicial);
      setTotalSeguidores(totalSeguidoresInicial);

      if (isApiError(err)) {
        navigate("/sabor-familia/error", { state: { statusCode: err.response?.status }, replace: true });
      } else {
        setError("Erro ao atualizar seguir.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { seguindo, totalSeguidores, alternar, loading, error };
}

export function useAlternarSeguirLista(perfilId: number, seguindoInicial: boolean) {
  const [seguindo, setSeguindo] = useState(seguindoInicial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSeguindo(seguindoInicial);
  }, [perfilId, seguindoInicial]);

  const alternar = async () => {
    if (loading) return;

    const novoEstado = !seguindo;
    setSeguindo(novoEstado);
    setLoading(true);
    setError(null);

    try {
      if (novoEstado) {
        await perfilService.seguirPerfil(perfilId);
      } else {
        await perfilService.deixarSeguirPerfil(perfilId);
      }
    } catch (err: unknown) {
      setSeguindo(seguindoInicial);

      if (isApiError(err)) {
        navigate("/sabor-familia/error", { state: { statusCode: err.response?.status }, replace: true });
      } else {
        setError("Erro ao atualizar seguir.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { seguindo, alternar, loading, error };
}
