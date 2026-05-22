import { createContext } from "react";
import type { LoginResponse } from "../dto/auth/response/LoginResponse";
import type { PerfilResponse } from "../dto/perfil/response/PerfilResponse";

export interface AuthContextData {
  token: string | null;
  usuarioId: number | null;
  perfilId: number | null;
  perfil: PerfilResponse | null;
  salvarToken: (loginResponse: LoginResponse) => void;
  salvarPerfil: (perfil: PerfilResponse) => void;
  limparAuth: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);
