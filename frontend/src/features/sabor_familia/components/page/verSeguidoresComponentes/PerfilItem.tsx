import type { PerfilResumoResponse } from "../../../dto/perfil/response/PerfilResumoResponse";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/UseAuth";
import { useAlternarSeguirLista } from "../../../hooks/UsePerfil";
import { PerfilAvatar } from "../../common/PerfilAvatar";

export function PerfilItem({ perfil }: { perfil: PerfilResumoResponse }) {
  const navigate = useNavigate();
  const { perfilId: meuPerfilId } = useAuth();
  const { seguindo, alternar, loading } = useAlternarSeguirLista(
    perfil.perfilId,
    perfil.seguindoPeloUsuario ?? false
  );

  const exibirSeguir =
    meuPerfilId !== null && perfil.perfilId !== meuPerfilId;

  return (
    <div className="lista-perfis-item">
      <button
        type="button"
        className="lista-perfis-item__main"
        onClick={() => navigate(`/sabor-familia/perfil/${perfil.perfilId}`)}
      >
        <PerfilAvatar
          src={perfil.fotoPerfilUrl}
          alt={perfil.nome}
          className="lista-perfis-avatar"
          placeholderClassName="lista-perfis-avatar lista-perfis-avatar--placeholder"
        />
        <span className="lista-perfis-nome">{perfil.nome}</span>
      </button>

      {exibirSeguir && (
        <button
          type="button"
          className={`lista-perfis-seguir ${seguindo ? "lista-perfis-seguir--ativo" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            alternar();
          }}
          disabled={loading}
        >
          {loading ? "…" : seguindo ? "Seguindo" : "Seguir"}
        </button>
      )}
    </div>
  );
}
