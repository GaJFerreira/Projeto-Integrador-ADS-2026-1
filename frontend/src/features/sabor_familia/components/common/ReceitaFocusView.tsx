import "../../pages/home/homeSaborFamilia.css";
import { useState } from "react";
import { useBuscarReceita, useRemoverReceita } from "../../hooks/UseReceita";
import { confirmarApagarReceita } from "../../utils/confirmarApagarReceita";
import type { ReceitaResponse } from "../../dto/receita/response/ReceitaResponse";
import type { VoltarDestino } from "../../utils/voltarDestino";
import FeedCard from "../page/homePageComponents/FeedCard";
import DetailPanel from "../page/homePageComponents/DetailPanel";
import { BotaoVoltar } from "./BotaoVoltar";
import { ErroPainel } from "./ErroPainel";

interface Props {
  receitaId: number;
  onVoltar: () => void;
  onReceitaRemovida?: () => void;
  voltarDestino: VoltarDestino;
  voltarDetalhe?: string;
  mainClassName?: string;
}

export function ReceitaFocusView({
  receitaId,
  onVoltar,
  onReceitaRemovida,
  voltarDestino,
  voltarDetalhe,
  mainClassName = "",
}: Props) {
  const { receita, loading, error, recarregar } = useBuscarReceita(receitaId);
  const { remover, loading: removendo } = useRemoverReceita();
  const [selecionada, setSelecionada] = useState<ReceitaResponse | null>(null);

  const handleRemoverReceita = (id: number) => {
    const titulo = receita?.id === id ? receita.detalhes.titulo : undefined;
    if (!confirmarApagarReceita(titulo)) return;

    remover(id, () => {
      setSelecionada(null);
      onReceitaRemovida?.();
      onVoltar();
    });
  };

  return (
    <>
      <main className={`home-main ${mainClassName}`.trim()}>
        <BotaoVoltar
          destino={voltarDestino}
          detalhe={voltarDetalhe}
          onClick={onVoltar}
        />

        {loading && (
          <div className="home-loading">
            <div className="home-loading__spinner" />
            <span>Carregando receita…</span>
          </div>
        )}

        {error && (
          <ErroPainel
            titulo="Não foi possível abrir a receita"
            mensagem={error}
            onTentarNovamente={recarregar}
            labelTentar="Tentar novamente"
          />
        )}

        {!loading && !error && receita && (
          <div className="feed-list">
            <FeedCard
              receita={receita}
              isSelected={selecionada?.id === receita.id}
              onClick={() =>
                setSelecionada(selecionada?.id === receita.id ? null : receita)
              }
              onRemover={handleRemoverReceita}
              removendo={removendo}
            />
          </div>
        )}
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

export default ReceitaFocusView;
