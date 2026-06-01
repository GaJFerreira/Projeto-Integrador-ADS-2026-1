import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { restricaoAlimentarService } from "../service/RestricaoalimentarService";
import { TEXTOS_INTERFACE } from "../utils/textosInterface";
import type { RestricaoAlimentarResponse } from "../dto/restricao/response/RestricaoAlimentarResponse";

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
        setError(TEXTOS_INTERFACE.erros.restricoes);
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
