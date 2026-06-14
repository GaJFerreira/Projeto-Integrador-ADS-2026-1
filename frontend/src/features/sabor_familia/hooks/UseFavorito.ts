import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { favoritoService } from "../service/FavoritoService";
import { TEXTOS_INTERFACE } from "../utils/textosInterface";

const DURACAO_FEEDBACK_MS = 5000;

export function useAlternarFavorito(receitaId: number, favoritadoInicial: boolean) {
  const [favoritado, setFavoritado] = useState(favoritadoInicial);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setFavoritado(favoritadoInicial);
  }, [receitaId, favoritadoInicial]);
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
        enqueueSnackbar(TEXTOS_INTERFACE.sucesso.receitaSalvaFavoritos, {
          variant: "success",
          autoHideDuration: DURACAO_FEEDBACK_MS,
        });
      } else {
        await favoritoService.removerFavorito(receitaId);
        enqueueSnackbar(TEXTOS_INTERFACE.sucesso.receitaRemovidaFavoritos, {
          variant: "info",
          autoHideDuration: DURACAO_FEEDBACK_MS,
        });
      }
    } catch (err: unknown) {
      setFavoritado(favoritado);

      const statusCode = (err as { response?: { status: number } })?.response?.status;
      if (statusCode) {
        navigate("/sabor-familia/error", { state: { statusCode } });
      } else {
        setError(TEXTOS_INTERFACE.erros.favorito);
      }
    } finally {
      setLoading(false);
    }
  };

  return { favoritado, alternar, loading, error };
}
