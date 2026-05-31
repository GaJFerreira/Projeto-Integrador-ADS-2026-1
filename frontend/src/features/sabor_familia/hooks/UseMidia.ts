import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getMidiaCacheEpoch,
  obterUrlMidia,
  obterUrlMidiaEmCache,
  subscribeMidiaCache,
} from "../lib/midiaCache";
import type { ContextoMidia, TipoMidia } from "../service/MidiaService";

function urlInicial(
  tipo: TipoMidia,
  entidadeId: number | undefined,
  contexto: ContextoMidia,
  possuiMidia: boolean | undefined
): string | null {
  if (!possuiMidia || entidadeId === undefined) return null;
  return obterUrlMidiaEmCache(tipo, entidadeId, contexto);
}

export function useMidiaUrl(
  tipo: TipoMidia,
  entidadeId: number | undefined,
  contexto: ContextoMidia,
  possuiMidia: boolean | undefined
) {
  const [url, setUrl] = useState<string | null>(() =>
    urlInicial(tipo, entidadeId, contexto, possuiMidia)
  );
  const [loading, setLoading] = useState(() => {
    if (!possuiMidia || entidadeId === undefined) return false;
    return urlInicial(tipo, entidadeId, contexto, possuiMidia) === null;
  });
  const [failed, setFailed] = useState(false);
  const cacheEpoch = useSyncExternalStore(
    subscribeMidiaCache,
    getMidiaCacheEpoch,
    getMidiaCacheEpoch
  );

  useEffect(() => {
    let cancelled = false;

    if (!possuiMidia || entidadeId === undefined) {
      setUrl(null);
      setFailed(false);
      setLoading(false);
      return;
    }

    const emCache = obterUrlMidiaEmCache(tipo, entidadeId, contexto);

    if (emCache) {
      setUrl(emCache);
      setFailed(false);
    } else {
      setUrl(null);
      setFailed(false);
    }

    setLoading(emCache === null);

    obterUrlMidia(tipo, entidadeId, contexto)
      .then((blobUrl) => {
        if (cancelled) return;
        if (!blobUrl) {
          setFailed(true);
          if (!emCache) setUrl(null);
        } else {
          setUrl(blobUrl);
          setFailed(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          if (!emCache) setUrl(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tipo, entidadeId, contexto, possuiMidia, cacheEpoch]);

  return { url, loading, failed };
}
