import "../../../pages/explorar/explorar.css";
import "../../../pages/home/homeSaborFamilia.css";
import { useState } from "react";
import { useBuscarReceita } from "../../../hooks/UseReceita";
import type { ReceitaResponse } from "../../../dto/receita/response/ReceitaResponse";
import Sidebar from "../homePageComponents/SideBar";
import FeedCard from "../homePageComponents/FeedCard";
import DetailPanel from "../homePageComponents/DetailPanel";

interface Props {
  receitaId: number;
  onVoltar: () => void;
}

export function ExplorarReceitaFocus({ receitaId, onVoltar }: Props) {
  const { receita, loading, error } = useBuscarReceita(receitaId);
  const [selecionada, setSelecionada] = useState<ReceitaResponse | null>(null);

  return (
    <div className="home-layout">
      <Sidebar />

      <main className="home-main explorar-focus-main">
        <button type="button" className="explorar-back" onClick={onVoltar}>
          ← Voltar para explorar
        </button>

        {loading && (
          <div className="home-loading">
            <div className="home-loading__spinner" />
            <span>Carregando receita...</span>
          </div>
        )}

        {error && <div className="home-error">{error}</div>}

        {!loading && !error && receita && (
          <div className="feed-list">
            <FeedCard
              receita={receita}
              isSelected={selecionada?.id === receita.id}
              onClick={() =>
                setSelecionada(selecionada?.id === receita.id ? null : receita)
              }
            />
          </div>
        )}
      </main>

      {selecionada && (
        <DetailPanel receita={selecionada} onClose={() => setSelecionada(null)} />
      )}
    </div>
  );
}

export default ExplorarReceitaFocus;
