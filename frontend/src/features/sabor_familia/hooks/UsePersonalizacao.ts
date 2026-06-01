import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { personalizacaoService } from "../service/PersonalizacaoService";
import { TEXTOS_INTERFACE } from "../utils/textosInterface";
import type { PersonalizacaoResumoResponse } from "../dto/personalizacao/response/PersonalizacaoResumoResponse";
import type { CatalogoPersonalizacaoResponse } from "../dto/personalizacao/response/CatalogoPersonalizacaoResponse";

function extrairStatusCode(err: unknown): number | undefined {
  return (err as { response?: { status: number } })?.response?.status;
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
        setError(TEXTOS_INTERFACE.erros.catalogo);
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
        setError(TEXTOS_INTERFACE.erros.caracteristicasReceita);
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
