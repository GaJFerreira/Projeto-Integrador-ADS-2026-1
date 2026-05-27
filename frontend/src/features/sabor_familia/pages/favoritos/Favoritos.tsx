import "./favoritos.css";
import "../home/homeSaborFamilia.css";
import { useState } from "react";
import { useBuscarReceitasFavoritas } from "../../hooks/UseReceita";
import type { ReceitaResponse } from "../../dto/receita/response/ReceitaResponse";
import Sidebar from "../../components/page/homePageComponents/SideBar";
import FeedCard from "../../components/page/homePageComponents/FeedCard";
import DetailPanel from "../../components/page/homePageComponents/DetailPanel";
import BookmarkIcon from "../../icon/menu/BookmarkIcon";

export function Favoritos() {
  const [page, setPage] = useState(0);
  const [acumuladas, setAcumuladas] = useState<ReceitaResponse[]>([]);
  const [selecionada, setSelecionada] = useState<ReceitaResponse | null>(null);
  const { favoritas, loading, error } = useBuscarReceitasFavoritas(page, 20);
  const paginaAtual  = favoritas?.content ?? [];
  const totalPages   = favoritas?.totalPages ?? 1;
  const totalItems   = favoritas?.totalElements ?? 0;
  const temMais      = page + 1 < totalPages;
  const lista = page === 0
    ? paginaAtual
    : [...acumuladas, ...paginaAtual.filter((r) => !acumuladas.find((a) => a.id === r.id))];

  const handleCarregarMais = () => {
    setAcumuladas(lista);
    setPage((p) => p + 1);
  };

  return (
    <div className="home-layout">
      <Sidebar />

      <main className="favoritos-main">
        {/* ── Cabeçalho ── */}
        <div className="favoritos-header">
          <BookmarkIcon active />
          <h2 className="favoritos-header__title">Receitas Salvas</h2>
          {!loading && totalItems > 0 && (
            <span className="favoritos-header__count">
              {totalItems} {totalItems === 1 ? "receita" : "receitas"}
            </span>
          )}
        </div>

        {/* ── Loading inicial ── */}
        {loading && page === 0 && (
          <div className="home-loading">
            <div className="home-loading__spinner" />
            <span>Carregando favoritos…</span>
          </div>
        )}

        {/* ── Erro ── */}
        {error && (
          <div className="home-error">{error}</div>
        )}

        {/* ── Vazio ── */}
        {!loading && !error && lista.length === 0 && (
          <div className="favoritos-empty">
            <BookmarkIcon active={false} />
            <p>Você ainda não salvou nenhuma receita.</p>
            <p>Toque no ícone 🔖 em qualquer receita para salvar.</p>
          </div>
        )}

        {/* ── Feed de favoritos ── */}
        <div className="favoritos-feed">
          {lista.map((receita) => (
            <FeedCard
              key={receita.id}
              receita={receita}
              isSelected={selecionada?.id === receita.id}
              onClick={() =>
                setSelecionada(selecionada?.id === receita.id ? null : receita)
              }
            />
          ))}
        </div>

        {/* ── Carregar mais ── */}
        {!loading && temMais && (
          <button className="favoritos-load-more" onClick={handleCarregarMais}>
            Carregar mais
          </button>
        )}

        {loading && page > 0 && (
          <div className="home-loading" style={{ margin: "1rem auto" }}>
            <div className="home-loading__spinner" />
          </div>
        )}
      </main>

      {/* ── Painel de detalhe ── */}
      {selecionada && (
        <DetailPanel
          receita={selecionada}
          onClose={() => setSelecionada(null)}
        />
      )}
    </div>
  );
}

export default Favoritos;
