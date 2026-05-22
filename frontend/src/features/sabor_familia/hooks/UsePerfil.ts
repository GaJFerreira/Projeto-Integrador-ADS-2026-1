import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { perfilService } from "../service/PerfilService";
import { authService } from "../service/AuthService";
import { useAuth } from "./UseAuth";
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

export function useBuscarPerfil(perfilId: number) {
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
  }, [buscar]);

  return { perfil, loading, error, recarregar: buscar };
}

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { salvarToken, salvarPerfil } = useAuth();
  const navigate = useNavigate();

  const login = async (usernameOrEmail: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const loginResponse = await authService.login({ usernameOrEmail, password });
      salvarToken(loginResponse);

      try {
        const perfil = await perfilService.buscarMeuPerfil();
        salvarPerfil(perfil);
        navigate("/sabor-familia/home");
      } catch (perfilErr: unknown) {
        const status = (perfilErr as { response?: { status: number } })?.response?.status;
        if (status === 404) {
          navigate("/sabor-familia/cadastro");
        } else {
          navigate("/sabor-familia/error", { state: { statusCode: status }, replace: true });
        }
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status;
      if (status === 401) {
        setError("Usuário ou senha inválidos.");
      } else if (status) {
        navigate("/sabor-familia/error", { state: { statusCode: status }, replace: true });
      } else {
        setError("Erro ao realizar login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
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

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await perfilService.buscarSeguidores(perfilId, page, size);
      setSeguidores(data);
    } catch (err: unknown) {
      if (isApiError(err)) {
        navigate("/sabor-familia/error", { state: { statusCode: err.response?.status }, replace: true });
      } else {
        setError("Erro ao buscar seguidores.");
      }
    } finally {
      setLoading(false);
    }
  }, [perfilId, page, size, navigate]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { seguidores, loading, error, recarregar: buscar };
}

export function useBuscarSeguindo(perfilId: number, page = 0, size = 20) {
  const [seguindo, setSeguindo] = useState<PageResponse<PerfilResumoResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const buscar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await perfilService.buscarSeguindo(perfilId, page, size);
      setSeguindo(data);
    } catch (err: unknown) {
      if (isApiError(err)) {
        navigate("/sabor-familia/error", { state: { statusCode: err.response?.status }, replace: true });
      } else {
        setError("Erro ao buscar seguindo.");
      }
    } finally {
      setLoading(false);
    }
  }, [perfilId, page, size, navigate]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { seguindo, loading, error, recarregar: buscar };
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
