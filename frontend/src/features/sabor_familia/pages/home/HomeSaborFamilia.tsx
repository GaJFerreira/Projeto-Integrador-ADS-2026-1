import "./homeSaborFamilia.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFeedPersonalizado, useRemoverReceita } from "../../hooks/UseReceita";
import { useAuth } from "../../hooks/UseAuth";
import {
  TEXTOS_INTERFACE,
  opcoesDialogoApagarReceita,
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
              {perfil?.detalhes?.nome
                ? `Bem-vindo(a), ${perfil.detalhes.nome.split(" ")[0]}!`
                : "Bem-vindo(a) ao Sabor da Família!"}
            </h2>
            <p className="home-empty__lead">
              Seu perfil foi criado com sucesso. Esta tela é o <strong>Início</strong>.
              Aqui aparecem as receitas das pessoas que você segue.
            </p>
            <p className="home-empty__lead">
              Como você acabou de entrar, ainda não há receitas para mostrar. Isso é normal.
            </p>
            <ol className="home-empty__steps">
              <li>
                Toque em <strong>Descobrir</strong> no menu ao lado.
                Leia: “Pessoas e receitas novas”.
              </li>
              <li>
                Escolha a opção <strong>Pessoas</strong>.
                Encontre cozinheiros que você goste.
              </li>
              <li>
                Abra um perfil e toque em <strong>Seguir esta pessoa</strong>.
                As receitas dela passam a aparecer aqui no Início.
              </li>
            </ol>
            <p className="home-empty__hint">
              Você também pode publicar a sua primeira receita em{" "}
              <strong>Publicar receita</strong> no menu.
            </p>
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
