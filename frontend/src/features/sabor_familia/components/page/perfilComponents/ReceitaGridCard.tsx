import "./receitaGridCard.css";
import type { ReceitaResumoResponse } from "../../../dto/receita/response/ReceitaResumoResponse";
import { ExplorarCard } from "../explorarComponents/ExplorarCard";

interface Props {
  receita: ReceitaResumoResponse;
  onAbrirReceita: (id: number) => void;
}

export function ReceitaGridCard({ receita, onAbrirReceita }: Props) {
  return (
    <div className="rgc-card-wrap">
      <ExplorarCard
        receita={receita}
        isSelected={false}
        onClick={() => onAbrirReceita(receita.id)}
      />
    </div>
  );
}
