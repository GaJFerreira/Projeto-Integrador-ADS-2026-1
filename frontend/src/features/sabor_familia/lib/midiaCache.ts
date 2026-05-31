import {
  midiaService,
  type ContextoMidia,
  type TipoMidia,
} from "../service/MidiaService";

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();
/** Chaves que retornaram 404 ou corpo inválido — evita reutilizar blob antigo na mesma sessão. */
const falhas = new Set<string>();

let cacheEpoch = 0;
const listeners = new Set<() => void>();

function bumpEpoch(): void {
  cacheEpoch += 1;
  listeners.forEach((listener) => listener());
}

export function subscribeMidiaCache(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMidiaCacheEpoch(): number {
  return cacheEpoch;
}

function chaveMidia(tipo: TipoMidia, id: number, contexto: ContextoMidia): string {
  return `${tipo}:${id}:${contexto}`;
}

function revogarEntradas(keys: string[]): void {
  for (const key of keys) {
    const url = cache.get(key);
    if (url) URL.revokeObjectURL(url);
    cache.delete(key);
    inflight.delete(key);
  }
}

export function invalidarMidia(tipo: TipoMidia, id: number): void {
  const prefix = `${tipo}:${id}:`;
  const keys = [...cache.keys(), ...inflight.keys()].filter((key) =>
    key.startsWith(prefix)
  );
  for (const key of falhas) {
    if (key.startsWith(prefix)) falhas.delete(key);
  }
  revogarEntradas([...new Set(keys)]);
  bumpEpoch();
}

/** Limpa todo o cache em memória (ex.: logout ou ao entrar no módulo após reset de dados). */
export function limparCacheMidia(): void {
  revogarEntradas([...cache.keys(), ...inflight.keys()]);
  falhas.clear();
  bumpEpoch();
}

/** Leitura síncrona do blob URL em cache (null se ausente ou marcado como falha). */
export function obterUrlMidiaEmCache(
  tipo: TipoMidia,
  id: number,
  contexto: ContextoMidia
): string | null {
  const key = chaveMidia(tipo, id, contexto);
  if (falhas.has(key)) return null;
  return cache.get(key) ?? null;
}

export async function obterUrlMidia(
  tipo: TipoMidia,
  id: number,
  contexto: ContextoMidia
): Promise<string | null> {
  const key = chaveMidia(tipo, id, contexto);

  if (falhas.has(key)) return null;

  const emCache = cache.get(key);
  if (emCache) return emCache;

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = midiaService
    .buscarMidia(tipo, id, contexto)
    .then((blob) => {
      const anterior = cache.get(key);
      if (anterior) {
        URL.revokeObjectURL(anterior);
        cache.delete(key);
      }

      if (!blob) {
        falhas.add(key);
        return null;
      }

      falhas.delete(key);
      const url = URL.createObjectURL(blob);
      cache.set(key, url);
      return url;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}
