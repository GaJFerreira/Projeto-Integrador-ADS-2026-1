import {
  CategoriaPersonalizacaoInfo,
  type CategoriaPersonalizacaoEnum,
} from "../../../dto/enums/CategoriaPersonalizacaoEnum";
import type { PersonalizacaoResumoResponse } from "../../../dto/personalizacao/response/PersonalizacaoResumoResponse";

interface Props {
  personalizacoesPorCategoria: Record<string, PersonalizacaoResumoResponse[]>;
  loading: boolean;
  selecionadas: Set<string>;
  onToggle: (codigo: string) => void;
}

export function Personalizacoes({
  personalizacoesPorCategoria,
  loading,
  selecionadas,
  onToggle,
}: Props) {
  return (
    <section className="ar-section">
      <h2 className="ar-section__title">Personalizações</h2>
      <p className="ar-section__desc">Caracterize sua receita para que mais pessoas a encontrem.</p>

      {loading ? (
        <div className="ar-loading-sm">Carregando personalizações…</div>
      ) : (
        Object.entries(personalizacoesPorCategoria).map(([cat, opcoes]) => {
          const info = CategoriaPersonalizacaoInfo[cat as CategoriaPersonalizacaoEnum];
          return (
            <div key={cat} className="ar-cat-group">
              <h3 className="ar-cat-group__title">{info?.label ?? cat}</h3>
              <div className="ar-chips">
                {opcoes.map((p) => (
                  <button
                    key={p.codigo}
                    type="button"
                    className={`ar-chip ${selecionadas.has(p.codigo) ? "ar-chip--active" : ""}`}
                    onClick={() => onToggle(p.codigo)}
                  >
                    {p.codigo}
                  </button>
                ))}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
