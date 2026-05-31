import "./favoritos.css";
import "../explorar/explorar.css";
import "../home/homeSaborFamilia.css";
import { useState } from "react";
import { useBuscarReceitasFavoritas } from "../../hooks/UseReceita";
import type { ReceitaResponse } from "../../dto/receita/response/ReceitaResponse";
import type { ReceitaResumoResponse } from "../../dto/receita/response/ReceitaResumoResponse";
import BookmarkIcon from "../../icon/menu/BookmarkIcon";
import { ExplorarCard } from "../../components/page/explorarComponents/ExplorarCard";
import { ExplorarReceitaFocus } from "../../components/page/explorarComponents/ExplorarReceitaFocus";

function receitaToResumo(receita: ReceitaResponse): ReceitaResumoResponse {
  return {
    id: receita.id,
    titulo: receita.detalhes.titulo,
    possuiMidia: receita.possuiMidia,
    restritaParaUsuario: receita.restritaParaUsuario,
    dataCadastro: receita.dataCadastro,
  };
}

export function Favoritos() {
  const [page, setPage] = useState(0);
  const [acumuladas, setAcumuladas] = useState<ReceitaResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { favoritas, loading, error } = useBuscarReceitasFavoritas(page, 20);
  const paginaAtual = favoritas?.content ?? [];
  const totalPages = favoritas?.totalPages ?? 1;
  const totalItems = favoritas?.totalElements ?? 0;
  const temMais = page + 1 < totalPages;
  const lista =
    page === 0
      ? paginaAtual
      : [
          ...acumuladas,
          ...paginaAtual.filter((r) => !acumuladas.find((a) => a.id === r.id)),
        ];

  const handleCarregarMais = () => {
    setAcumuladas(lista);
    setPage((p) => p + 1);
  };

  if (selectedId !== null) {
    return (
      <ExplorarReceitaFocus
        receitaId={selectedId}
        onVoltar={() => setSelectedId(null)}
        voltarDestino="favoritos"
      />
    );
  }

  return (
    <main className="explorar-main favoritos-main">
        <div className="favoritos-header">
          <BookmarkIcon active />
          <h2 className="favoritos-header__title">Receitas Favoritas</h2>
        </div>

        {loading && page === 0 && (
          <div className="explorar-loading">
            <div className="explorar-spinner" />
            <span>Carregando favoritos…</span>
          </div>
        )}

        {error && <div className="explorar-error">{error}</div>}

        {!loading && !error && totalItems > 0 && (
          <p className="explorar-count">
            {totalItems} receita{totalItems !== 1 ? "s" : ""} salva
            {totalItems !== 1 ? "s" : ""}
          </p>
        )}

        {!loading && !error && lista.length === 0 && (
          <div className="favoritos-empty">
            <BookmarkIcon active={false} />
            <p>Você ainda não salvou nenhuma receita.</p>
            <p>Toque no ícone 🔖 em qualquer receita para salvar.</p>
          </div>
        )}

        <div className="explorar-grid">
          {lista.map((receita) => (
            <ExplorarCard
              key={receita.id}
              receita={receitaToResumo(receita)}
              isSelected={false}
              onClick={() => setSelectedId(receita.id)}
            />
          ))}
        </div>

        {!loading && temMais && (
          <button className="explorar-load-more" onClick={handleCarregarMais}>
            Carregar mais
          </button>
        )}

        {loading && page > 0 && (
          <div className="explorar-loading" style={{ margin: "1rem auto" }}>
            <div className="explorar-spinner" />
          </div>
        )}
    </main>
  );
}

export default Favoritos;
