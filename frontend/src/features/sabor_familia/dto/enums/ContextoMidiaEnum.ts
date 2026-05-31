export const ContextoMidiaPerfil = {
  AVATAR: "avatar",
  CAPA_PERFIL: "capa-perfil",
} as const;

export const ContextoMidiaReceita = {
  CAPA_GRID: "capa-grid",
  CAPA_FEED: "capa-feed",
} as const;

export type ContextoMidiaPerfil =
  (typeof ContextoMidiaPerfil)[keyof typeof ContextoMidiaPerfil];

export type ContextoMidiaReceita =
  (typeof ContextoMidiaReceita)[keyof typeof ContextoMidiaReceita];
