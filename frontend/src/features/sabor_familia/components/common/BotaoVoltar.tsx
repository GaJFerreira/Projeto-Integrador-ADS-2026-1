import {
  obterTextoVoltar,
  type VoltarDestino,
} from "../../utils/voltarDestino";
import "./botaoVoltar.css";

interface Props {
  onClick: () => void;
  destino: VoltarDestino;
  /** Nome do perfil ou outro detalhe contextual (ex.: título da lista). */
  detalhe?: string;
  /** Sobrescreve só o trecho após "Voltar para". */
  destinoLabel?: string;
  variant?: "barra" | "compacto";
  className?: string;
}

export function BotaoVoltar({
  onClick,
  destino,
  detalhe,
  destinoLabel,
  variant = "barra",
  className = "",
}: Props) {
  const textos = obterTextoVoltar(destino, detalhe);
  const destinoExibido = destinoLabel ?? textos.destino;

  const classes = [
    "sf-voltar",
    variant === "compacto" ? "sf-voltar--compacto" : "sf-voltar--barra",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-label={textos.ariaLabel}
    >
      <span className="sf-voltar__icon" aria-hidden>
        ←
      </span>
      <span className="sf-voltar__text">
        <span className="sf-voltar__prefixo">Voltar para</span>
        <span className="sf-voltar__destino">{destinoExibido}</span>
      </span>
    </button>
  );
}

export default BotaoVoltar;
