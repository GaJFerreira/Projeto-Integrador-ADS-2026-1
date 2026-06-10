import "./favoritos.css";
import "../explorar/explorar.css";
import "../home/homeSaborFamilia.css";
import { useState } from "react";
import { useBuscarReceitasFavoritas } from "../../hooks/UseReceita";
import type { ReceitaResponse } from "../../dto/receita/response/ReceitaResponse";
import type { ReceitaResumoResponse } from "../../dto/receita/response/ReceitaResumoResponse";
import BookmarkIcon from "../../icon/menu/BookmarkIcon";
import { TEXTOS_INTERFACE } from "../../utils/textosInterface";
import { IndicadorCarregamento } from "../../components/common/IndicadorCarregamento";
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
        <header className="favoritos-header">
          <BookmarkIcon active />
          <div className="favoritos-header__text">
            <h1 className="favoritos-header__title">{TEXTOS_INTERFACE.favoritos.titulo}</h1>
            <p className="favoritos-header__subtitle">{TEXTOS_INTERFACE.favoritos.subtitulo}</p>
          </div>
        </header>

        {loading && page === 0 && (
          <IndicadorCarregamento
            estilo="grade"
            texto={TEXTOS_INTERFACE.carregamento.receitasSalvas}
          />
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
            <p className="favoritos-empty__lead">{TEXTOS_INTERFACE.favoritos.mensagemVazia}</p>
            <ol className="favoritos-empty__passos">
              <li>{TEXTOS_INTERFACE.favoritos.passo1}</li>
              <li>{TEXTOS_INTERFACE.favoritos.passo2}</li>
            </ol>
          </div>
        )}

        {lista.length > 0 && (
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
        )}

        {!loading && temMais && (
          <button className="explorar-load-more" onClick={handleCarregarMais}>
            Carregar mais
          </button>
        )}

        {loading && page > 0 && (
          <IndicadorCarregamento
            estilo="grade"
            className="explorar-loading--inline"
            texto={TEXTOS_INTERFACE.carregamento.maisReceitas}
          />
        )}
    </main>
  );
}

export default Favoritos;
