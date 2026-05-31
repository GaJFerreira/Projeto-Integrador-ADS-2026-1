import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { limparCacheMidia } from "../lib/midiaCache";
import { perfilService } from "../service/PerfilService";
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

  const salvarPerfil = useCallback((perfilSalvo: PerfilResponse) => {
    localStorage.setItem("sf_perfilId", String(perfilSalvo.id));
    setPerfilId(perfilSalvo.id);
    setPerfil(perfilSalvo);
  }, []);

  const limparAuth = useCallback(() => {
    limparCacheMidia();
    localStorage.removeItem("sf_perfilId");
    setPerfilId(null);
    setPerfil(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || perfil) return;

    let cancelled = false;

    perfilService
      .buscarMeuPerfil()
      .then((data) => {
        if (!cancelled) salvarPerfil(data);
      })
      .catch(() => {
        /* sem perfil (cadastro) ou erro de sessão — login/cadastro tratam */
      });

    return () => {
      cancelled = true;
    };
  }, [perfil, salvarPerfil]);

  const value = useMemo(
    () => ({ usuarioId, perfilId, perfil, salvarPerfil, limparAuth }),
    [usuarioId, perfilId, perfil, salvarPerfil, limparAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
