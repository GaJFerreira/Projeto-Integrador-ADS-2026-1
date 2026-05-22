import { useState } from "react";
// import { useEffect } from "react";
import { AuthContext } from "./AuthContext";
import type { LoginResponse } from "../dto/auth/response/LoginResponse";
import type { PerfilResponse } from "../dto/perfil/response/PerfilResponse";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("accessToken")
  );
  const [usuarioId, setUsuarioId] = useState<number | null>(() => {
    const stored = localStorage.getItem("usuarioId");
    return stored ? Number(stored) : null;
  });
  const [perfilId, setPerfilId] = useState<number | null>(() => {
    const stored = localStorage.getItem("perfilId");
    return stored ? Number(stored) : null;
  });
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);

  // Hook adicionado para monitorar e exibir o token no console
  // useEffect(() => {
  //   console.log("Token atual no AuthProvider:", token);
  // }, [token]);

  const salvarToken = (loginResponse: LoginResponse) => {
    localStorage.setItem("accessToken", loginResponse.accessToken);
    localStorage.setItem("usuarioId", String(loginResponse.userId));
    setToken(loginResponse.accessToken);
    setUsuarioId(loginResponse.userId);
  };

  const salvarPerfil = (perfil: PerfilResponse) => {
    localStorage.setItem("perfilId", String(perfil.id));
    setPerfilId(perfil.id);
    setPerfil(perfil);
  };

  const limparAuth = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("usuarioId");
    localStorage.removeItem("perfilId");
    setToken(null);
    setUsuarioId(null);
    setPerfilId(null);
    setPerfil(null);
  };

  return (
    <AuthContext.Provider value={{ token, usuarioId, perfilId, perfil, salvarToken, salvarPerfil, limparAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
