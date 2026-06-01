import "./explorarCard.css";
import { formatDataGrid } from "../../../utils/formatarTempo";
import { TEXTOS_INTERFACE } from "../../../utils/textosInterface";
import { ContextoMidiaReceita } from "../../../dto/enums/ContextoMidiaEnum";
import { ReceitaMidiaImage } from "../../common/ReceitaMidiaImage";
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
      <ReceitaMidiaImage
        receitaId={receita.id}
        possuiMidia={receita.possuiMidia}
        contexto={ContextoMidiaReceita.CAPA_GRID}
        alt={receita.titulo}
        wrapClassName="explorar-card__image-wrap"
        className="explorar-card__image"
        emptyClassName="explorar-card__image explorar-card__image--empty"
      />

      <div className="explorar-card__body">
        <p className="explorar-card__title">{receita.titulo}</p>
        <div className="explorar-card__meta">
          {data && <span className="explorar-card__date">{data}</span>}
          {receita.restritaParaUsuario && (
            <span className="explorar-card__restricted">
              {TEXTOS_INTERFACE.descobrir.receitaRestrita}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
