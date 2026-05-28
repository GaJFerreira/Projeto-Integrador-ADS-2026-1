import "./explorarCard.css";
import { formatDataGrid } from "../../../utils/formatarTempo";
import type { ReceitaResumoResponse } from "../../../dto/receita/response/ReceitaResumoResponse";

export function ExplorarCard({
  receita,
  isSelected,
  onClick,
}: {
  receita: ReceitaResumoResponse;
  isSelected: boolean;
  onClick: () => void;
}) {
  const data = formatDataGrid(receita.dataCadastro);

  return (
    <article
      className={`explorar-card ${isSelected ? "explorar-card--selected" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="explorar-card__image-wrap">
        {receita.fotoCapaUrl ? (
          <img
            src={receita.fotoCapaUrl}
            alt={receita.titulo}
            className="explorar-card__image"
          />
        ) : (
          <div className="explorar-card__image explorar-card__image--empty">
            Sem imagem
          </div>
        )}
      </div>

      <div className="explorar-card__body">
        <p className="explorar-card__title">{receita.titulo}</p>
        <div className="explorar-card__meta">
          {data && <span className="explorar-card__date">{data}</span>}
          {receita.restritaParaUsuario && (
            <span className="explorar-card__restricted">Restrita</span>
          )}
        </div>
      </div>
    </article>
  );
}
