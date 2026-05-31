import "./receitaAcoesAutor.css";
import { useNavigate } from "react-router-dom";

export type ReceitaAcoesVariant = "inline" | "panel";

interface Props {
  receitaId: number;
  onRemover: () => void;
  disabled?: boolean;
  variant?: ReceitaAcoesVariant;
  className?: string;
}

export function ReceitaAcoesAutor({
  receitaId,
  onRemover,
  disabled = false,
  variant = "panel",
  className = "",
}: Props) {
  const navigate = useNavigate();

  const irParaEditar = () => {
    navigate(`/sabor-familia/receita/${receitaId}/editar`);
  };

  return (
    <div
      className={`receita-acoes receita-acoes--${variant} ${className}`.trim()}
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label="Ações da sua receita"
    >
      {variant === "panel" && (
        <span className="receita-acoes__label">Sua publicação</span>
      )}

      <div className="receita-acoes__buttons">
        <button
          type="button"
          className="receita-acoes__btn receita-acoes__btn--editar"
          onClick={irParaEditar}
          disabled={disabled}
        >
          Editar
        </button>
        <button
          type="button"
          className="receita-acoes__btn receita-acoes__btn--apagar"
          onClick={onRemover}
          disabled={disabled}
        >
          {disabled ? "Apagando…" : "Apagar"}
        </button>
      </div>
    </div>
  );
}
