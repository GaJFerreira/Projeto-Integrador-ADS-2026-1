import type { MouseEvent } from "react";
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

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={loading}
      aria-pressed={seguindo}
    >
      {loading ? "…" : seguindo ? "Seguindo" : "Seguir"}
    </button>
  );
}

export default BotaoSeguir;
