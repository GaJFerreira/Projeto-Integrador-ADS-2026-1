import type { TipoRefeicaoEnum } from "../../../dto/enums/TipoRefeicaoEnum";

const TIPO_REFEICAO_LABELS: Record<TipoRefeicaoEnum, string> = {
  CAFE_DA_MANHA: "Café da manhã",
  ALMOCO:        "Almoço",
  LANCHE:        "Lanche",
  JANTAR:        "Jantar",
  SOBREMESA:     "Sobremesa",
  OUTRO:         "Outro",
};

const TIPOS_REFEICAO = Object.entries(TIPO_REFEICAO_LABELS) as [TipoRefeicaoEnum, string][];

interface Props {
  titulo: string;
  onTituloChange: (v: string) => void;
  tipoRefeicao: TipoRefeicaoEnum | "";
  onTipoRefeicaoChange: (v: TipoRefeicaoEnum) => void;
  tempoPreparoMin: number | "";
  onTempoPreparoMinChange: (v: number | "") => void;
  qtdPorcoes: number | "";
  onQtdPorcoesChange: (v: number | "") => void;
}

export function InformacoesBasicas({
  titulo,
  onTituloChange,
  tipoRefeicao,
  onTipoRefeicaoChange,
  tempoPreparoMin,
  onTempoPreparoMinChange,
  qtdPorcoes,
  onQtdPorcoesChange,
}: Props) {
  return (
    <section className="ar-section">
      <h2 className="ar-section__title">Informações básicas</h2>

      <div className="ar-field">
        <label className="ar-label">
          Título <span className="ar-required">*</span>
        </label>
        <input
          className="ar-input"
          placeholder="Ex: Bolo de chocolate da vovó"
          value={titulo}
          onChange={(e) => onTituloChange(e.target.value)}
          required
        />
      </div>

      <div className="ar-row">
        <div className="ar-field">
          <label className="ar-label">
            Tipo de refeição <span className="ar-required">*</span>
          </label>
          <select
            className="ar-select"
            value={tipoRefeicao}
            onChange={(e) => onTipoRefeicaoChange(e.target.value as TipoRefeicaoEnum)}
            required
          >
            <option value="" disabled>Selecione…</option>
            {TIPOS_REFEICAO.map(([valor, label]) => (
              <option key={valor} value={valor}>{label}</option>
            ))}
          </select>
        </div>

        <div className="ar-field">
          <label className="ar-label">Tempo de preparo (min)</label>
          <input
            className="ar-input"
            type="number"
            min={1}
            placeholder="Ex: 40"
            value={tempoPreparoMin}
            onChange={(e) =>
              onTempoPreparoMinChange(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>

        <div className="ar-field">
          <label className="ar-label">Porções</label>
          <input
            className="ar-input"
            type="number"
            min={1}
            placeholder="Ex: 8"
            value={qtdPorcoes}
            onChange={(e) =>
              onQtdPorcoesChange(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>
      </div>
    </section>
  );
}
