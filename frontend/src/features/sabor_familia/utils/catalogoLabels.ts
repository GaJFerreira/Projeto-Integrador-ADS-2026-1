import type { PersonalizacaoResumoResponse } from "../dto/personalizacao/response/PersonalizacaoResumoResponse";
import type { PersonalizacaoResponse } from "../dto/personalizacao/response/PersonalizacaoResponse";
import type { RestricaoAlimentarResumoResponse } from "../dto/restricao/response/RestricaoAlimentarResumoResponse";
import type { RestricaoAlimentarResponse } from "../dto/restricao/response/RestricaoAlimentarResponse";

type ContextoCatalogo = "receita" | "perfil";

export function labelPersonalizacao(
  item: PersonalizacaoResumoResponse | PersonalizacaoResponse,
  contexto: ContextoCatalogo = "receita"
): string {
  if ("label" in item && item.label?.trim()) {
    return item.label.trim();
  }
  if (contexto === "perfil" && "labelPerfil" in item && item.labelPerfil?.trim()) {
    return item.labelPerfil.trim();
  }
  if (contexto === "receita" && "labelReceita" in item && item.labelReceita?.trim()) {
    return item.labelReceita.trim();
  }
  return item.codigo;
}

/** Rótulo de restrição no contexto de receita (detalhe, formulário de receita). */
export function labelRestricaoReceita(
  item: RestricaoAlimentarResumoResponse | RestricaoAlimentarResponse
): string {
  if ("labelReceita" in item && item.labelReceita?.trim()) {
    return item.labelReceita.trim();
  }
  if ("label" in item && item.label?.trim()) {
    return item.label.trim();
  }
  return item.codigo;
}

/** Rótulo de restrição no contexto de perfil. */
export function labelRestricaoPerfil(
  item: RestricaoAlimentarResumoResponse | RestricaoAlimentarResponse
): string {
  if ("labelPerfil" in item && item.labelPerfil?.trim()) {
    return item.labelPerfil.trim();
  }
  if ("label" in item && item.label?.trim()) {
    return item.label.trim();
  }
  return item.codigo;
}
