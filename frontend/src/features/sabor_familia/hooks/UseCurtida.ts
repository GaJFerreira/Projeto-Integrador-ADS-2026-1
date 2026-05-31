import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { curtidaService } from "../service/CurtidaService";

export function useAlternarCurtida(receitaId: number, curtidoInicial: boolean, totalInicial: number) {
  const [curtido, setCurtido] = useState(curtidoInicial);
  const [totalCurtidas, setTotalCurtidas] = useState(totalInicial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const alternar = async () => {
    if (loading) return;

    const novoEstado = !curtido;
    setCurtido(novoEstado);
    setTotalCurtidas((prev) => (novoEstado ? prev + 1 : prev - 1));
    setLoading(true);
    setError(null);

    try {
      if (novoEstado) {
        await curtidaService.adicionarCurtida(receitaId);
      } else {
        await curtidaService.removerCurtida(receitaId);
      }
    } catch (err: unknown) {
      setCurtido(curtido);
      setTotalCurtidas(totalInicial);

      const statusCode = (err as { response?: { status: number } })?.response?.status;
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao atualizar curtida.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { curtido, totalCurtidas, alternar, loading, error };
}
