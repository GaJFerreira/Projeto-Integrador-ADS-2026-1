import {
  CategoriaPersonalizacaoInfo,
  type CategoriaPersonalizacaoEnum,
} from "../../../dto/enums/CategoriaPersonalizacaoEnum";
import type { PersonalizacaoResumoResponse } from "../../../dto/personalizacao/response/PersonalizacaoResumoResponse";
import { labelPersonalizacao } from "../../../utils/catalogoLabels";
import { SfPillByCategory } from "../../common/SfCatalogoPills";

interface Props {
  personalizacoesPorCategoria: Record<string, PersonalizacaoResumoResponse[]>;
  loading: boolean;
  selecionadas: Set<string>;
  onToggle: (codigo: string) => void;
  contexto?: "receita" | "perfil";
}

export function Personalizacoes({
  personalizacoesPorCategoria,
  loading,
  selecionadas,
  onToggle,
  contexto = "receita",
}: Props) {
  return (
    <section className="ar-section">
      <h2 className="ar-section__title">Personalizações</h2>
      <p className="ar-section__desc">Caracterize sua receita para que mais pessoas a encontrem.</p>

      {loading ? (
        <div className="ar-loading-sm">Carregando personalizações…</div>
      ) : (
        <SfPillByCategory
          grouped={personalizacoesPorCategoria}
          selecionadas={selecionadas}
          onToggle={onToggle}
          getLabel={(p) => labelPersonalizacao(p, contexto)}
          getCategoryLabel={(cat) =>
            CategoriaPersonalizacaoInfo[cat as CategoriaPersonalizacaoEnum]?.label ?? cat
          }
        />
      )}
    </section>
  );
}
