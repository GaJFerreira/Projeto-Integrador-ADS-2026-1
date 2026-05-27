import { useState } from "react";
import { AuthContext } from "./AuthContext";
import type { PerfilResponse } from "../dto/perfil/response/PerfilResponse";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuarioId] = useState<number | null>(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") ?? "null");
      return user?.userId ?? null;
    } catch {
      return null;
    }
  });

  const [perfilId, setPerfilId] = useState<number | null>(() => {
    const stored = localStorage.getItem("sf_perfilId");
    return stored ? Number(stored) : null;
  });

  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);

  const salvarPerfil = (perfil: PerfilResponse) => {
    localStorage.setItem("sf_perfilId", String(perfil.id));
    setPerfilId(perfil.id);
    setPerfil(perfil);
  };

  const limparAuth = () => {
    localStorage.removeItem("sf_perfilId");
    setPerfilId(null);
    setPerfil(null);
  };

  return (
    <AuthContext.Provider value={{ usuarioId, perfilId, perfil, salvarPerfil, limparAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
