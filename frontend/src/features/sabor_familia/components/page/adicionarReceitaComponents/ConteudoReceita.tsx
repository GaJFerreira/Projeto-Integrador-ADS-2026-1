interface Props {
  ingredientes: string;
  onIngredientesChange: (v: string) => void;
  modoPreparo: string;
  onModoPreparoChange: (v: string) => void;
  historia: string;
  onHistoriaChange: (v: string) => void;
}

export function ConteudoReceita({
  ingredientes,
  onIngredientesChange,
  modoPreparo,
  onModoPreparoChange,
  historia,
  onHistoriaChange,
}: Props) {
  return (
    <section className="ar-section">
      <h2 className="ar-section__title">Conteúdo da receita</h2>

      <div className="ar-field">
        <label className="ar-label">
          Ingredientes <span className="ar-required">*</span>
        </label>
        <textarea
          className="ar-textarea"
          rows={5}
          placeholder="Liste os ingredientes, um por linha ou separados por vírgula"
          value={ingredientes}
          onChange={(e) => onIngredientesChange(e.target.value)}
          required
        />
      </div>

      <div className="ar-field">
        <label className="ar-label">
          Modo de preparo <span className="ar-required">*</span>
        </label>
        <textarea
          className="ar-textarea"
          rows={7}
          placeholder="Descreva o passo a passo do preparo"
          value={modoPreparo}
          onChange={(e) => onModoPreparoChange(e.target.value)}
          required
        />
      </div>

      <div className="ar-field">
        <label className="ar-label">
          História <span className="ar-optional">(opcional)</span>
        </label>
        <textarea
          className="ar-textarea"
          rows={3}
          placeholder="Conte a história por trás dessa receita…"
          value={historia}
          onChange={(e) => onHistoriaChange(e.target.value)}
        />
      </div>
    </section>
  );
}
