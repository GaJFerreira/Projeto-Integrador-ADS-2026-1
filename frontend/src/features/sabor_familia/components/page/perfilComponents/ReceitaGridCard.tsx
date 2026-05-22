import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ReceitaResumoResponse } from "../../../dto/receita/response/ReceitaResumoResponse";

interface Props {
  receita: ReceitaResumoResponse;
  isProprioPerfil: boolean;
  onRemover: (id: number) => void;
}

export function ReceitaGridCard({ receita, isProprioPerfil, onRemover }: Props) {
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
    <div className="rgc-card" onClick={() => !menuAberto && navigate(`/receita/${receita.id}`)}>

      {/* Imagem ou placeholder */}
      {receita.fotoCapaUrl ? (
        <img src={receita.fotoCapaUrl} alt={receita.titulo} className="rgc-img" />
      ) : (
        <div className="rgc-placeholder">
          <span className="rgc-placeholder__title">{receita.titulo}</span>
        </div>
      )}

      {/* Menu 3 pontos — só para o próprio perfil */}
      {isProprioPerfil && (
        <div
          className="rgc-menu-wrap"
          ref={menuRef}
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

      {/* Alerta de restrição */}
      {receita.restritaParaUsuario && (
        <div className="rgc-badge-restrita" title="Contém restrições alimentares">⚠</div>
      )}
    </div>
  );
}
