import "./receitaGrid.css";
import type { ReceitaResumoResponse } from "../../../dto/receita/response/ReceitaResumoResponse";
import { ReceitaGridCard } from "./ReceitaGridCard";

interface Props {
  receitas: ReceitaResumoResponse[];
  loading: boolean;
  onAbrirReceita: (id: number) => void;
}

export function ReceitasGrid({ receitas, loading, onAbrirReceita }: Props) {
  return (
    <div className="rg-section">
      <div className="rg-header">
        <span className="rg-header__icon">⊞</span>
        <span className="rg-header__label">POSTS</span>
      </div>

      {loading && (
        <div className="rg-loading">
          <div className="home-loading__spinner" />
        </div>
      )}

      {!loading && receitas.length === 0 && (
        <div className="rg-empty">Nenhuma receita publicada ainda.</div>
      )}

      {!loading && receitas.length > 0 && (
        <div className="rg-grid">
          {receitas.map((receita) => (
            <ReceitaGridCard
              key={receita.id}
              receita={receita}
              onAbrirReceita={onAbrirReceita}
            />
          ))}
        </div>
      )}
    </div>
  );
}
