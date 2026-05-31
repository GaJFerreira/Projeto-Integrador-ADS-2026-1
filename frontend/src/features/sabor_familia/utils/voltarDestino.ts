export type VoltarDestino =
  | "explorar"
  | "favoritos"
  | "perfil"
  | "home"
  | "configuracoes"
  | "mensagens"
  | "seguidores"
  | "seguindo";

export interface VoltarDestinoTexto {
  /** Texto curto exibido após "Voltar para" */
  destino: string;
  ariaLabel: string;
}

export function obterTextoVoltar(
  tipo: VoltarDestino,
  detalhe?: string
): VoltarDestinoTexto {
  const nome = detalhe?.trim();

  switch (tipo) {
    case "explorar":
      return {
        destino: "explorar receitas",
        ariaLabel: "Voltar para a página de explorar receitas",
      };
    case "favoritos":
      return {
        destino: "favoritos",
        ariaLabel: "Voltar para a lista de receitas favoritas",
      };
    case "perfil":
      return {
        destino: nome ? `o perfil de ${nome}` : "o perfil",
        ariaLabel: nome
          ? `Voltar para o perfil de ${nome}`
          : "Voltar para o perfil",
      };
    case "home":
      return {
        destino: "o início",
        ariaLabel: "Voltar para a página inicial",
      };
    case "configuracoes":
      return {
        destino: "configurações",
        ariaLabel: "Voltar para as configurações do perfil",
      };
    case "mensagens":
      return {
        destino: "mensagens",
        ariaLabel: "Voltar para as conversas",
      };
    case "seguidores":
      return {
        destino: nome ? `seguidores de ${nome}` : "seguidores",
        ariaLabel: nome
          ? `Voltar para a lista de seguidores de ${nome}`
          : "Voltar para a lista de seguidores",
      };
    case "seguindo":
      return {
        destino: nome ? `quem ${nome} segue` : "seguindo",
        ariaLabel: nome
          ? `Voltar para a lista de perfis que ${nome} segue`
          : "Voltar para a lista de seguindo",
      };
    default:
      return {
        destino: "a página anterior",
        ariaLabel: "Voltar para a página anterior",
      };
  }
}
