import "./receitaGrid.css";
import type { ReceitaResumoResponse } from "../../../dto/receita/response/ReceitaResumoResponse";
import { ReceitaGridCard } from "./ReceitaGridCard";
import { IndicadorCarregamento } from "../../common/IndicadorCarregamento";
import { TEXTOS_INTERFACE } from "../../../utils/textosInterface";

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
        <span className="rg-header__label">{TEXTOS_INTERFACE.perfil.gridTitulo.toUpperCase()}</span>
      </div>

      {loading && (
        <IndicadorCarregamento
          estilo="grade"
          texto={TEXTOS_INTERFACE.carregamento.receitas}
        />
      )}

      {!loading && receitas.length === 0 && (
        <div className="rg-empty">{TEXTOS_INTERFACE.perfil.gridVazia}</div>
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
