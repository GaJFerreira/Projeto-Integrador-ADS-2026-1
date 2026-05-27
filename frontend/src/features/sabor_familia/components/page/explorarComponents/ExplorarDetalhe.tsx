import "../../page/homePageComponents/detailPanel.css";
import "../../../pages/home/homeSaborFamilia.css";
import DetailPanel from "../../../components/page/homePageComponents/DetailPanel";
import { useBuscarReceita } from "../../../hooks/UseReceita";

export function ExplorarDetalhe({
  receitaId,
  onClose,
}: {
  receitaId: number;
  onClose: () => void;
}) {
  const { receita, loading } = useBuscarReceita(receitaId);

  if (loading) {
    return (
      <aside className="detail-panel">
        <button className="detail-panel__close" onClick={onClose} title="Fechar">✕</button>
        <div className="detail-panel__scroll" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <div className="home-loading">
            <div className="home-loading__spinner" />
            <span>Carregando receita…</span>
          </div>
        </div>
      </aside>
    );
  }

  if (!receita) return null;

  return <DetailPanel receita={receita} onClose={onClose} />;
}
