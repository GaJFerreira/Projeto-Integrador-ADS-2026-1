import "./perfilHeader.css";
import { useNavigate } from "react-router-dom";
import type { PerfilResponse } from "../../../dto/perfil/response/PerfilResponse";

interface Props {
  perfil: PerfilResponse;
  totalPosts: number;
  seguindo: boolean;
  totalSeguidores: number;
  onAlternarSeguir: () => void;
  loadingSeguir: boolean;
}

export function PerfilHeader({
  perfil,
  totalPosts,
  seguindo,
  totalSeguidores,
  onAlternarSeguir,
  loadingSeguir,
}: Props) {
  const navigate = useNavigate();

  return (
    <header className="ph-header">

      {/* ── Faixa de cover ── */}
      <div className="ph-cover">
        <div className="ph-cover__pattern" />
      </div>

      {/* ── Corpo ── */}
      <div className="ph-body">

        {/* Linha: avatar + botões */}
        <div className="ph-avatar-row">
          <div className="ph-avatar-wrap">
            {perfil.detalhes.fotoPerfilUrl ? (
              <img
                src={perfil.detalhes.fotoPerfilUrl}
                alt={perfil.detalhes.nome}
                className="ph-avatar"
              />
            ) : (
              <div className="ph-avatar ph-avatar--placeholder">
                {perfil.detalhes.nome.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="ph-actions">
            {!perfil.proprioPerfil && (
              <button
                className={`ph-btn-seguir ${seguindo ? "ph-btn-seguir--seguindo" : ""}`}
                onClick={onAlternarSeguir}
                disabled={loadingSeguir}
              >
                {loadingSeguir ? "…" : seguindo ? "Seguindo" : "Seguir"}
              </button>
            )}
            {perfil.proprioPerfil && (
              <button
                className="ph-btn-editar"
                onClick={() => navigate("/sabor-familia/configuracoes")}
              >
                Editar perfil
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="ph-info">

          {/* Nome */}
          <h1 className="ph-nome">{perfil.detalhes.nome}</h1>

          {/* Stats */}
          <div className="ph-stats">
            <div className="ph-stat">
              <span className="ph-stat__num">{totalPosts}</span>
              <span className="ph-stat__label">posts</span>
            </div>

            <button
              className="ph-stat ph-stat--btn"
              onClick={() => navigate(`/sabor-familia/perfil/${perfil.id}/seguidores`)}
            >
              <span className="ph-stat__num">{totalSeguidores}</span>
              <span className="ph-stat__label">seguidores</span>
            </button>

            <button
              className="ph-stat ph-stat--btn"
              onClick={() => navigate(`/sabor-familia/perfil/${perfil.id}/seguindo`)}
            >
              <span className="ph-stat__num">{perfil.estatisticas.countSeguindo}</span>
              <span className="ph-stat__label">seguindo</span>
            </button>
          </div>

          {/* Bio */}
          {perfil.detalhes.bio && (
            <p className="ph-bio">{perfil.detalhes.bio}</p>
          )}

          {/* Tags de restrição alimentar */}
          {perfil.restricoesAlimentares?.length > 0 && (
            <div className="ph-restricoes">
              {perfil.restricoesAlimentares.map((r) => (
                <span key={r.codigo} className="ph-restricao-tag" title={r.exemplos}>
                  {r.labelPerfil || r.codigo}
                </span>
              ))}
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
