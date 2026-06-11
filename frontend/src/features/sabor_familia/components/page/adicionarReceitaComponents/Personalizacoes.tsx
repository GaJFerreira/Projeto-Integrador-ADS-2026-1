import {
  CategoriaPersonalizacaoInfo,
  type CategoriaPersonalizacaoEnum,
} from "../../../dto/enums/CategoriaPersonalizacaoEnum";
import type { PersonalizacaoResumoResponse } from "../../../dto/personalizacao/response/PersonalizacaoResumoResponse";
import { labelPersonalizacao } from "../../../utils/catalogoLabels";
import { TEXTOS_INTERFACE } from "../../../utils/textosInterface";
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
      <h2 className="ar-section__title">{TEXTOS_INTERFACE.receita.caracteristicasTitulo}</h2>
      <p className="ar-section__desc">{TEXTOS_INTERFACE.receita.caracteristicasDesc}</p>

      {loading ? (
        <div className="ar-loading-sm">{TEXTOS_INTERFACE.receita.carregandoCaracteristicas}</div>
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
