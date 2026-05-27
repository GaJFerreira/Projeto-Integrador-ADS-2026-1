import "./verSeguidores.css";
import "../home/homeSaborFamilia.css";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBuscarSeguidores, useBuscarSeguindo } from "../../hooks/UsePerfil";
import type { PerfilResumoResponse } from "../../dto/perfil/response/PerfilResumoResponse";
import Sidebar from "../../components/page/homePageComponents/SideBar";
import { PerfilItem } from "../../components/page/verSeguidoresComponentes/PerfilItem";

// ── Seguidores ────────────────────────────────────────────────────────────────
export function VerSeguidores() {
  const { perfilId } = useParams<{ perfilId: string }>();
  const navigate     = useNavigate();
  const id           = Number(perfilId);
  const [page, setPage]       = useState(0);
  const [acumulados, setAcumulados] = useState<PerfilResumoResponse[]>([]);
  const { seguidores, loading, error } = useBuscarSeguidores(id, page, 30);
  const paginaAtual = seguidores?.content ?? [];
  const total       = seguidores?.totalElements ?? 0;
  const temMais     = page + 1 < (seguidores?.totalPages ?? 1);
  const lista = page === 0
    ? paginaAtual
    : [...acumulados, ...paginaAtual.filter((p) => !acumulados.find((a) => a.perfilId === p.perfilId))];

  const handleCarregarMais = () => {
    setAcumulados(lista);
    setPage((p) => p + 1);
  };

  return (
    <div className="home-layout">
      <Sidebar />

      <main className="lista-perfis-main">
        {/* ── Cabeçalho ── */}
        <div className="lista-perfis-header">
          <button className="lista-perfis-back" onClick={() => navigate(-1)} title="Voltar">
            ←
          </button>
          <h2 className="lista-perfis-title">Seguidores</h2>
          {!loading && total > 0 && (
            <span className="lista-perfis-count">{total}</span>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && page === 0 && (
          <div className="home-loading">
            <div className="home-loading__spinner" />
            <span>Carregando seguidores…</span>
          </div>
        )}

        {/* ── Erro ── */}
        {error && <div className="home-error">{error}</div>}

        {/* ── Vazio ── */}
        {!loading && !error && lista.length === 0 && (
          <div className="lista-perfis-empty">
            <p>Nenhum seguidor ainda.</p>
          </div>
        )}

        {/* ── Lista ── */}
        {lista.length > 0 && (
          <div className="lista-perfis-list">
            {lista.map((p) => (
              <PerfilItem key={p.perfilId} perfil={p} />
            ))}
          </div>
        )}

        {/* ── Carregar mais ── */}
        {!loading && temMais && (
          <button className="lista-perfis-load-more" onClick={handleCarregarMais}>
            Carregar mais
          </button>
        )}
        {loading && page > 0 && (
          <div className="home-loading" style={{ margin: "1rem auto" }}>
            <div className="home-loading__spinner" />
          </div>
        )}
      </main>
    </div>
  );
}

// ── Seguindo ──────────────────────────────────────────────────────────────────
export function VerSeguindo() {
  const { perfilId } = useParams<{ perfilId: string }>();
  const navigate     = useNavigate();
  const id           = Number(perfilId);
  const [page, setPage]       = useState(0);
  const [acumulados, setAcumulados] = useState<PerfilResumoResponse[]>([]);
  const { seguindo, loading, error } = useBuscarSeguindo(id, page, 30);
  const paginaAtual = seguindo?.content ?? [];
  const total       = seguindo?.totalElements ?? 0;
  const temMais     = page + 1 < (seguindo?.totalPages ?? 1);
  const lista = page === 0
    ? paginaAtual
    : [...acumulados, ...paginaAtual.filter((p) => !acumulados.find((a) => a.perfilId === p.perfilId))];

  const handleCarregarMais = () => {
    setAcumulados(lista);
    setPage((p) => p + 1);
  };

  return (
    <div className="home-layout">
      <Sidebar />

      <main className="lista-perfis-main">
        {/* ── Cabeçalho ── */}
        <div className="lista-perfis-header">
          <button className="lista-perfis-back" onClick={() => navigate(-1)} title="Voltar">
            ←
          </button>
          <h2 className="lista-perfis-title">Seguindo</h2>
          {!loading && total > 0 && (
            <span className="lista-perfis-count">{total}</span>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && page === 0 && (
          <div className="home-loading">
            <div className="home-loading__spinner" />
            <span>Carregando seguindo…</span>
          </div>
        )}

        {/* ── Erro ── */}
        {error && <div className="home-error">{error}</div>}

        {/* ── Vazio ── */}
        {!loading && !error && lista.length === 0 && (
          <div className="lista-perfis-empty">
            <p>Este perfil não segue ninguém ainda.</p>
          </div>
        )}

        {/* ── Lista ── */}
        {lista.length > 0 && (
          <div className="lista-perfis-list">
            {lista.map((p) => (
              <PerfilItem key={p.perfilId} perfil={p} />
            ))}
          </div>
        )}

        {/* ── Carregar mais ── */}
        {!loading && temMais && (
          <button className="lista-perfis-load-more" onClick={handleCarregarMais}>
            Carregar mais
          </button>
        )}
        {loading && page > 0 && (
          <div className="home-loading" style={{ margin: "1rem auto" }}>
            <div className="home-loading__spinner" />
          </div>
        )}
      </main>
    </div>
  );
}
