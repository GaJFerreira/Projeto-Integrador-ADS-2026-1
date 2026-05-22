import "./homeSaborFamilia.css";
import { useState } from "react";
import { useFeedPersonalizado } from "../../hooks/UseReceita";
import type { ReceitaResponse } from "../../dto/receita/response/ReceitaResponse";
import Sidebar from "../../components/page/homePageComponents/SideBar";
import DetailPanel from "../../components/page/homePageComponents/DetailPanel";
import FeedCard from "../../components/page/homePageComponents/FeedCard";

export function HomeSaborFamilia() {
  const [page] = useState(0);
  const { feed, loading, error } = useFeedPersonalizado(page);
  const [selecionada, setSelecionada] = useState<ReceitaResponse | null>(null);

  const receitas = feed?.content ?? [];

  return (
    <div className="home-layout">
      <Sidebar />

      <main className="home-main">
        {loading && (
          <div className="home-loading">
            <div className="home-loading__spinner" />
            <span>Carregando seu feed…</span>
          </div>
        )}

        {error && (
          <div className="home-error">{error}</div>
        )}

        {!loading && !error && receitas.length === 0 && (
          <div className="home-empty">
            <p>Ainda sem receitas no seu feed.</p>
            <p>Siga alguns perfis para ver o que eles estão cozinhando!</p>
          </div>
        )}

        <div className="feed-list">
          {receitas.map((receita) => (
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
      </main>

      {selecionada && (
        <DetailPanel
          receita={selecionada}
          onClose={() => setSelecionada(null)}
        />
      )}
    </div>
  );
}

export default HomeSaborFamilia;
