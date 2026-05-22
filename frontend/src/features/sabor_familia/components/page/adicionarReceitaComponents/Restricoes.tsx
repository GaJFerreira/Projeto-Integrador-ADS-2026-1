import type { RestricaoAlimentarResponse } from "../../../dto/restricao/response/RestricaoAlimentarResponse";

interface Props {
  restricoes: RestricaoAlimentarResponse[];
  loading: boolean;
  selecionadas: Set<string>;
  onToggle: (codigo: string) => void;
}

export function Restricoes({ restricoes, loading, selecionadas, onToggle }: Props) {
  return (
    <section className="ar-section">
      <h2 className="ar-section__title">Restrições alimentares</h2>
      <p className="ar-section__desc">Marque os alertas que se aplicam a esta receita.</p>

      {loading ? (
        <div className="ar-loading-sm">Carregando restrições…</div>
      ) : (
        <div className="ar-chips">
          {restricoes.map((r) => (
            <button
              key={r.codigo}
              type="button"
              className={`ar-chip ${selecionadas.has(r.codigo) ? "ar-chip--active" : ""}`}
              onClick={() => onToggle(r.codigo)}
            >
              {r.codigo}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
