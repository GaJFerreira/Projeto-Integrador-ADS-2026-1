import "./receitaGridCard.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ReceitaResumoResponse } from "../../../dto/receita/response/ReceitaResumoResponse";
import { ExplorarCard } from "../explorarComponents/ExplorarCard";

interface Props {
  receita: ReceitaResumoResponse;
  isProprioPerfil: boolean;
  onRemover: (id: number) => void;
  onAbrirReceita: (id: number) => void;
}

export function ReceitaGridCard({ receita, isProprioPerfil, onRemover, onAbrirReceita }: Props) {
  const navigate           = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef            = useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="rgc-card-wrap" ref={menuRef}>
      <div className={menuAberto ? "rgc-card-wrap__dimmed" : ""}>
        <ExplorarCard
          receita={receita}
          isSelected={false}
          onClick={() => !menuAberto && onAbrirReceita(receita.id)}
        />
      </div>

      {/* Menu 3 pontos — só para o próprio perfil */}
      {isProprioPerfil && (
        <div
          className="rgc-menu-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="rgc-menu-btn"
            onClick={() => setMenuAberto((prev) => !prev)}
            aria-label="Opções da receita"
          >
            ···
          </button>

          {menuAberto && (
            <div className="rgc-dropdown">
              <button
                className="rgc-dropdown__item"
                onClick={() => {
                  setMenuAberto(false);
                  navigate(`/receita/${receita.id}/editar`);
                }}
              >
                Editar
              </button>
              <button
                className="rgc-dropdown__item rgc-dropdown__item--danger"
                onClick={() => {
                  setMenuAberto(false);
                  onRemover(receita.id);
                }}
              >
                Remover
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
