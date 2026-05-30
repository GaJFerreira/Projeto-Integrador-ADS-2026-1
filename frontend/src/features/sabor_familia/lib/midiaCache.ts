import { midiaService, type TipoMidia } from "../service/MidiaService";

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

function chaveMidia(tipo: TipoMidia, id: number): string {
  return `${tipo}:${id}`;
}

export function invalidarMidia(tipo: TipoMidia, id: number): void {
  const key = chaveMidia(tipo, id);
  const url = cache.get(key);
  if (url) {
    URL.revokeObjectURL(url);
  }
  cache.delete(key);
}

export async function obterUrlMidia(tipo: TipoMidia, id: number): Promise<string | null> {
  const key = chaveMidia(tipo, id);

  const cached = cache.get(key);
  if (cached) return cached;

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = midiaService.buscarMidia(tipo, id).then((blob) => {
    if (!blob || blob.size === 0) return null;
    const url = URL.createObjectURL(blob);
    cache.set(key, url);
    return url;
  }).finally(() => {
    inflight.delete(key);
  });

  inflight.set(key, promise);
  return promise;
}
