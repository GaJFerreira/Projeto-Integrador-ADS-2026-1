import { useMidiaUrl } from "../../hooks/UseMidia";
import {
  ContextoMidiaReceita,
  type ContextoMidiaReceita as ContextoMidiaReceitaType,
} from "../../dto/enums/ContextoMidiaEnum";
import "./receitaMidiaImage.css";

interface Props {
  receitaId: number;
  possuiMidia?: boolean;
  contexto?: ContextoMidiaReceitaType;
  alt: string;
  className?: string;
  wrapClassName?: string;
  emptyClassName?: string;
  onClick?: () => void;
}

export function ReceitaMidiaImage({
  receitaId,
  possuiMidia = false,
  contexto = ContextoMidiaReceita.CAPA_FEED,
  alt,
  className = "",
  wrapClassName = "",
  emptyClassName = "",
  onClick,
}: Props) {
  const { url, loading, failed } = useMidiaUrl(
    "receita",
    receitaId,
    contexto,
    possuiMidia
  );
  const showImage = possuiMidia && url && !failed;

  return (
    <div className={wrapClassName} onClick={onClick}>
      {showImage ? (
        <img src={url} alt={alt} className={className} />
      ) : (
        <div className={`receita-midia-image--empty ${emptyClassName}`.trim()}>
          {loading && possuiMidia ? "Carregando…" : "Sem imagem"}
        </div>
      )}
    </div>
  );
}

export default ReceitaMidiaImage;
