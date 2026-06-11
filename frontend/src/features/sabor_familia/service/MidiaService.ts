import api from "../lib/Api";
import type { ContextoMidiaPerfil, ContextoMidiaReceita } from "../dto/enums/ContextoMidiaEnum";

export type TipoMidia = "perfil" | "receita";

export type ContextoMidia = ContextoMidiaPerfil | ContextoMidiaReceita;

function extrairContentType(headers: unknown): string {
  if (!headers || typeof headers !== "object") return "";

  const h = headers as {
    get?: (name: string) => string | undefined;
    "content-type"?: string;
    "Content-Type"?: string;
  };

  const raw =
    (typeof h.get === "function" ? h.get("content-type") : undefined) ??
    h["content-type"] ??
    h["Content-Type"];

  return raw?.split(";")[0]?.trim().toLowerCase() ?? "";
}

function detectarContentTypeImagem(data: ArrayBuffer): string | null {
  const u8 = new Uint8Array(data, 0, Math.min(12, data.byteLength));
  if (u8.length >= 3 && u8[0] === 0xff && u8[1] === 0xd8 && u8[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    u8.length >= 4 &&
    u8[0] === 0x89 &&
    u8[1] === 0x50 &&
    u8[2] === 0x4e &&
    u8[3] === 0x47
  ) {
    return "image/png";
  }
  return null;
}

function blobDeResposta(data: ArrayBuffer, contentType: string): Blob | null {
  if (!data || data.byteLength === 0) return null;

  let tipo = contentType;
  if (!tipo.startsWith("image/")) {
    tipo = detectarContentTypeImagem(data) ?? "";
  }
  if (!tipo.startsWith("image/")) return null;

  return new Blob([data], { type: tipo });
}

export const midiaService = {
  buscarMidia: async (
    tipo: TipoMidia,
    entidadeId: number,
    contexto: ContextoMidia
  ): Promise<Blob | null> => {
    try {
      const response = await api.get<ArrayBuffer>(`/midia/${tipo}/${entidadeId}`, {
        params: { contexto },
        responseType: "arraybuffer",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      return blobDeResposta(response.data, extrairContentType(response.headers));
    } catch {
      return null;
    }
  },
};
