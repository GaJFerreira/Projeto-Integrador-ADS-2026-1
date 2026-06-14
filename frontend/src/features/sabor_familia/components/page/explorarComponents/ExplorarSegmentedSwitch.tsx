import "./explorarSegmentedSwitch.css";
import { TEXTOS_INTERFACE } from "../../../utils/textosInterface";

export type ExplorarModo = "receitas" | "perfis";

interface Props {
  modo: ExplorarModo;
  onChange: (modo: ExplorarModo) => void;
}

export function ExplorarSegmentedSwitch({ modo, onChange }: Props) {
  const isReceitas = modo === "receitas";

  return (
    <div
      className={`explorar-segmented ${isReceitas ? "" : "explorar-segmented--perfis"}`}
      role="tablist"
      aria-label={TEXTOS_INTERFACE.descobrir.rotuloAbas}
    >
      <div className="explorar-segmented__thumb" aria-hidden />
      <button
        type="button"
        role="tab"
        aria-selected={isReceitas}
        className={`explorar-segmented__option ${isReceitas ? "explorar-segmented__option--active" : ""}`}
        onClick={() => onChange("receitas")}
      >
        {TEXTOS_INTERFACE.descobrir.abaReceitas}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={!isReceitas}
        className={`explorar-segmented__option ${!isReceitas ? "explorar-segmented__option--active" : ""}`}
        onClick={() => onChange("perfis")}
      >
        {TEXTOS_INTERFACE.descobrir.abaPessoas}
      </button>
    </div>
  );
}

export default ExplorarSegmentedSwitch;
