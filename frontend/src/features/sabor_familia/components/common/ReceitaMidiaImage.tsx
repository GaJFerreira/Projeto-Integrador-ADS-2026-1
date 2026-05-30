import { useMidiaUrl } from "../../hooks/UseMidia";
import "./receitaMidiaImage.css";

interface Props {
  receitaId: number;
  possuiMidia?: boolean;
  alt: string;
  className?: string;
  wrapClassName?: string;
  emptyClassName?: string;
  onClick?: () => void;
}

export function ReceitaMidiaImage({
  receitaId,
  possuiMidia = false,
  alt,
  className = "",
  wrapClassName = "",
  emptyClassName = "",
  onClick,
}: Props) {
  const { url, loading, failed } = useMidiaUrl("receita", receitaId, possuiMidia);
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
