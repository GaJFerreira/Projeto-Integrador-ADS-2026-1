type DateInput = string | number[] | Date | null | undefined;

function isValidDate(d: Date): boolean {
  return !Number.isNaN(d.getTime());
}

function parseLegacyDateString(raw: string): Date | null {
  const value = raw.trim();
  if (!value) return null;

  // "2026-05-22 14:30:00" -> "2026-05-22T14:30:00"
  const normalized = value.replace(" ", "T");

  // Tenta parser nativo primeiro
  const direct = new Date(normalized);
  if (isValidDate(direct)) return direct;

  // Fallback manual para formatos sem timezone (compatível com Safari)
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2})(?::(\d{2})(?::(\d{2}))?)?)?$/
  );
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const hour = Number(match[4] ?? 0);
  const minute = Number(match[5] ?? 0);
  const second = Number(match[6] ?? 0);

  const localDate = new Date(year, month, day, hour, minute, second);
  return isValidDate(localDate) ? localDate : null;
}

export function parseDate(value?: DateInput): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  // Formato array do Jackson: [yyyy, mm, dd, hh, mm, ss, ...]
  if (Array.isArray(value)) {
    const [y, m, d, hh = 0, mm = 0, ss = 0] = value;
    if ([y, m, d].some((n) => typeof n !== "number")) return null;
    const arrDate = new Date(y, m - 1, d, hh, mm, ss);
    return isValidDate(arrDate) ? arrDate : null;
  }

  return parseLegacyDateString(value);
}

export function formatDateTime(
  value?: string | null,
  options?: Intl.DateTimeFormatOptions,
  fallback = "-"
): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return date.toLocaleString("pt-BR", options);
}

export function formatDate(value?: string | null, fallback = "-"): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString("pt-BR");
}
