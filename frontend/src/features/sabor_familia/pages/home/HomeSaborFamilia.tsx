import "./homeSaborFamilia.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFeedPersonalizado, useRemoverReceita } from "../../hooks/UseReceita";
import { useAuth } from "../../hooks/UseAuth";
import {
  TEXTOS_INTERFACE,
  opcoesDialogoApagarReceita,
  textoBoasVindasInicio,
} from "../../utils/textosInterface";
import { useDialogoConfirmacao } from "../../context/DialogoConfirmacao";
import type { ReceitaResponse } from "../../dto/receita/response/ReceitaResponse";
import DetailPanel from "../../components/page/homePageComponents/DetailPanel";
import FeedCard from "../../components/page/homePageComponents/FeedCard";
import { IndicadorCarregamento } from "../../components/common/IndicadorCarregamento";

export function HomeSaborFamilia() {
  const navigate = useNavigate();
  const pedirConfirmacao = useDialogoConfirmacao();
  const { perfil } = useAuth();
  const [page] = useState(0);
  const { feed, loading, error, recarregar } = useFeedPersonalizado(page);
  const { remover, loading: removendo } = useRemoverReceita();
  const [selecionada, setSelecionada] = useState<ReceitaResponse | null>(null);

  const receitas = feed?.content ?? [];

  const handleRemoverReceita = async (receitaId: number) => {
    const receita =
      receitas.find((r) => r.id === receitaId) ??
      (selecionada?.id === receitaId ? selecionada : null);
    const confirmado = await pedirConfirmacao(
      opcoesDialogoApagarReceita(receita?.detalhes.titulo)
    );
    if (!confirmado) return;

    remover(receitaId, () => {
      setSelecionada((atual) => (atual?.id === receitaId ? null : atual));
      recarregar();
    });
  };

  return (
    <>
      <main className="home-main">
        <header className="home-page-header">
          <h1 className="home-page-header__title">{TEXTOS_INTERFACE.inicio.titulo}</h1>
          <p className="home-page-header__subtitle">{TEXTOS_INTERFACE.inicio.subtitulo}</p>
        </header>

        {loading && (
          <IndicadorCarregamento texto={TEXTOS_INTERFACE.carregamento.receitas} />
        )}

        {error && (
          <div className="home-error">{error}</div>
        )}

        {!loading && !error && receitas.length === 0 && (
          <div className="home-empty" role="status">
            <h2 className="home-empty__title">
              {textoBoasVindasInicio(perfil?.detalhes?.nome)}
            </h2>
            <p className="home-empty__lead">{TEXTOS_INTERFACE.inicio.emptyLead1}</p>
            <p className="home-empty__lead">{TEXTOS_INTERFACE.inicio.emptyLead2}</p>
            <ol className="home-empty__steps">
              <li>{TEXTOS_INTERFACE.inicio.emptyPasso1}</li>
              <li>{TEXTOS_INTERFACE.inicio.emptyPasso2}</li>
              <li>{TEXTOS_INTERFACE.inicio.emptyPasso3}</li>
            </ol>
            <p className="home-empty__hint">{TEXTOS_INTERFACE.inicio.emptyDicaPublicar}</p>
            <button
              type="button"
              className="home-empty__cta"
              onClick={() => navigate("/sabor-familia/explorar")}
            >
              {TEXTOS_INTERFACE.inicio.botaoSemReceitas}
            </button>
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
              onRemover={handleRemoverReceita}
              removendo={removendo}
            />
          ))}
        </div>
      </main>

      {selecionada && (
        <DetailPanel
          receita={selecionada}
          onClose={() => setSelecionada(null)}
          onRemover={handleRemoverReceita}
          removendo={removendo}
        />
      )}
    </>
  );
}

export default HomeSaborFamilia;
