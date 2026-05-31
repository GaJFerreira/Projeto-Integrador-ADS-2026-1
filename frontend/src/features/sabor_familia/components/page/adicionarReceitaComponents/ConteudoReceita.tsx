interface Props {
  ingredientes: string;
  onIngredientesChange: (v: string) => void;
  modoPreparo: string;
  onModoPreparoChange: (v: string) => void;
  historia: string;
  onHistoriaChange: (v: string) => void;
  errosCampo?: Record<string, string>;
}

export function ConteudoReceita({
  ingredientes,
  onIngredientesChange,
  modoPreparo,
  onModoPreparoChange,
  historia,
  onHistoriaChange,
  errosCampo = {},
}: Props) {
  return (
    <section className="ar-section">
      <h2 className="ar-section__title">Conteúdo da receita</h2>

      <div className="ar-field">
        <label className="ar-label">
          Ingredientes <span className="ar-required">*</span>
        </label>
        <textarea
          className={`ar-textarea ${errosCampo.ingredientes ? "ar-textarea--error" : ""}`}
          rows={5}
          placeholder="Liste os ingredientes, um por linha ou separados por vírgula"
          value={ingredientes}
          onChange={(e) => onIngredientesChange(e.target.value)}
          required
          aria-invalid={!!errosCampo.ingredientes}
        />
        {errosCampo.ingredientes && (
          <span className="ar-field-error">{errosCampo.ingredientes}</span>
        )}
      </div>

      <div className="ar-field">
        <label className="ar-label">
          Modo de preparo <span className="ar-required">*</span>
        </label>
        <textarea
          className={`ar-textarea ${errosCampo.modoPreparo ? "ar-textarea--error" : ""}`}
          rows={7}
          placeholder="Descreva o passo a passo do preparo"
          value={modoPreparo}
          onChange={(e) => onModoPreparoChange(e.target.value)}
          required
          aria-invalid={!!errosCampo.modoPreparo}
        />
        {errosCampo.modoPreparo && (
          <span className="ar-field-error">{errosCampo.modoPreparo}</span>
        )}
      </div>

      <div className="ar-field">
        <label className="ar-label">
          História <span className="ar-optional">(opcional)</span>
        </label>
        <textarea
          className={`ar-textarea ${errosCampo.historia ? "ar-textarea--error" : ""}`}
          rows={3}
          placeholder="Conte a história por trás dessa receita…"
          value={historia}
          onChange={(e) => onHistoriaChange(e.target.value)}
          aria-invalid={!!errosCampo.historia}
        />
        {errosCampo.historia && (
          <span className="ar-field-error">{errosCampo.historia}</span>
        )}
      </div>
    </section>
  );
}
