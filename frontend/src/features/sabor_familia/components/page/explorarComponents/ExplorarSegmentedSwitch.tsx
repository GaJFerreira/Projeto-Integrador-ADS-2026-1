import "./explorarSegmentedSwitch.css";

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
      aria-label="Explorar receitas ou perfis"
    >
      <div className="explorar-segmented__thumb" aria-hidden />
      <button
        type="button"
        role="tab"
        aria-selected={isReceitas}
        className={`explorar-segmented__option ${isReceitas ? "explorar-segmented__option--active" : ""}`}
        onClick={() => onChange("receitas")}
      >
        Receitas
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={!isReceitas}
        className={`explorar-segmented__option ${!isReceitas ? "explorar-segmented__option--active" : ""}`}
        onClick={() => onChange("perfis")}
      >
        Perfis
      </button>
    </div>
  );
}

export default ExplorarSegmentedSwitch;
