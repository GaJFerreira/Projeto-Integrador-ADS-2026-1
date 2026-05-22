import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { favoritoService } from "../service/FavoritoService";

export function useAlternarFavorito(receitaId: number, favoritadoInicial: boolean) {
  const [favoritado, setFavoritado] = useState(favoritadoInicial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const alternar = async () => {
    if (loading) return;

    const novoEstado = !favoritado;
    setFavoritado(novoEstado);
    setLoading(true);
    setError(null);

    try {
      if (novoEstado) {
        await favoritoService.adicionarFavorito(receitaId);
      } else {
        await favoritoService.removerFavorito(receitaId);
      }
    } catch (err: unknown) {
      setFavoritado(favoritado);

      const statusCode = (err as { response?: { status: number } })?.response?.status;
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError("Erro ao atualizar favorito.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { favoritado, alternar, loading, error };
}
