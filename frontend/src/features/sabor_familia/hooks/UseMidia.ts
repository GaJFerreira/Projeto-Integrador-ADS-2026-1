import { useEffect, useState } from "react";
import { obterUrlMidia } from "../lib/midiaCache";
import { type TipoMidia } from "../service/MidiaService";

export function useMidiaUrl(
  tipo: TipoMidia,
  entidadeId: number | undefined,
  possuiMidia: boolean | undefined
) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!possuiMidia || entidadeId === undefined) {
      setUrl(null);
      setLoading(false);
      setFailed(false);
      return;
    }

    setLoading(true);
    setFailed(false);

    obterUrlMidia(tipo, entidadeId)
      .then((blobUrl) => {
        if (cancelled) return;
        if (!blobUrl) {
          setFailed(true);
          setUrl(null);
        } else {
          setUrl(blobUrl);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tipo, entidadeId, possuiMidia]);

  return { url, loading, failed };
}
