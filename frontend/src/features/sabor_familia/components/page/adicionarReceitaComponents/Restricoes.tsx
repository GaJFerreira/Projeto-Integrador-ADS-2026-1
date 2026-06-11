import type { RestricaoAlimentarResponse } from "../../../dto/restricao/response/RestricaoAlimentarResponse";
import { labelRestricaoReceita } from "../../../utils/catalogoLabels";
import { SfPillList } from "../../common/SfCatalogoPills";

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
        <SfPillList
          items={restricoes}
          selecionadas={selecionadas}
          onToggle={onToggle}
          getLabel={labelRestricaoReceita}
        />
      )}
    </section>
  );
}
