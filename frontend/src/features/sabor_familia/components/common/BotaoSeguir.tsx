import type { MouseEvent } from "react";
import { TEXTOS_INTERFACE } from "../../utils/textosInterface";
import "./btnSeguir.css";

interface Props {
  seguindo: boolean;
  loading?: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  compacto?: boolean;
  className?: string;
}

export function BotaoSeguir({
  seguindo,
  loading = false,
  onClick,
  compacto = false,
  className = "",
}: Props) {
  const classes = [
    "sf-seguir-btn",
    seguindo ? "sf-seguir-btn--seguindo" : "",
    compacto ? "sf-seguir-btn--compacto" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const label = loading
    ? "…"
    : seguindo
      ? compacto
        ? TEXTOS_INTERFACE.seguir.botaoSeguindoCurto
        : TEXTOS_INTERFACE.seguir.botaoSeguindo
      : compacto
        ? TEXTOS_INTERFACE.seguir.botaoSeguirCurto
        : TEXTOS_INTERFACE.seguir.botaoSeguir;

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={loading}
      aria-pressed={seguindo}
      title={seguindo ? TEXTOS_INTERFACE.seguir.botaoSeguindo : TEXTOS_INTERFACE.seguir.botaoSeguir}
    >
      {label}
    </button>
  );
}

export default BotaoSeguir;
