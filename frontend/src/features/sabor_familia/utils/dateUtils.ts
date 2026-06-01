/**
 * Converte datas retornadas pela API do Sabor Família.
 * O backend (JacksonConfig) serializa LocalDateTime como "dd/MM/yyyy HH:mm:ss"
 * e LocalDate como "dd/MM/yyyy" — formatos que `new Date(string)` não aceita.
 */
export function parseDataApi(value: string | null | undefined): Date | null {
  if (!value || typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const iso = new Date(trimmed);
    return Number.isNaN(iso.getTime()) ? null : iso;
  }

  const brDateTime = trimmed.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (brDateTime) {
    const [, day, month, year, hour = "0", minute = "0", second = "0"] = brDateTime;
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const fallback = new Date(trimmed);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function isoParaBR(value: string): string {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function mesmoDia(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

export function diaAnterior(ref: Date = new Date()): Date {
  const ontem = new Date(ref);
  ontem.setDate(ontem.getDate() - 1);
  return ontem;
}
