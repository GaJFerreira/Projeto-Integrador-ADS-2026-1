import type { PerfilResumoResponse } from "../../../dto/perfil/response/PerfilResumoResponse";
import { useNavigate } from "react-router-dom";

export function PerfilItem({ perfil }: { perfil: PerfilResumoResponse }) {
  const navigate = useNavigate();

  return (
    <button
      className="lista-perfis-item"
      onClick={() => navigate(`/sabor-familia/perfil/${perfil.perfilId}`)}
    >
      {perfil.fotoPerfilUrl ? (
        <img
          src={perfil.fotoPerfilUrl}
          alt={perfil.nome}
          className="lista-perfis-avatar"
        />
      ) : (
        <div className="lista-perfis-avatar--placeholder">
          {perfil.nome?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}
      <span className="lista-perfis-nome">{perfil.nome}</span>
    </button>
  );
}
