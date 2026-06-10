import { createContext } from "react";
import type { PerfilResponse } from "../dto/perfil/response/PerfilResponse";

export interface AuthContextData {
  usuarioId: number | null;
  perfilId: number | null;
  perfil: PerfilResponse | null;
  salvarPerfil: (perfil: PerfilResponse) => void;
  limparAuth: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);
