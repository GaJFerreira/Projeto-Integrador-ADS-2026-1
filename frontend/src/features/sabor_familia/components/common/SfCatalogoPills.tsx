import "./sfPillToggle.css";

interface PillItem {
  codigo: string;
}

interface SfPillListProps<T extends PillItem> {
  items: T[];
  selecionadas: Set<string>;
  onToggle: (codigo: string) => void;
  getLabel: (item: T) => string;
  getTitle?: (item: T) => string | undefined;
  emptyMessage?: string;
}

export function SfPillList<T extends PillItem>({
  items,
  selecionadas,
  onToggle,
  getLabel,
  getTitle,
  emptyMessage,
}: SfPillListProps<T>) {
  if (items.length === 0) {
    return emptyMessage ? (
      <span className="sf-pill-empty">{emptyMessage}</span>
    ) : null;
  }

  return (
    <div className="sf-pill-group">
      {items.map((item) => {
        const selected = selecionadas.has(item.codigo);
        return (
          <button
            key={item.codigo}
            type="button"
            className={`sf-pill ${selected ? "sf-pill--selected" : ""}`}
            onClick={() => onToggle(item.codigo)}
            title={getTitle?.(item)}
          >
            {getLabel(item)}
          </button>
        );
      })}
    </div>
  );
}

interface SfPillByCategoryProps<T extends PillItem> {
  grouped: Record<string, T[]>;
  selecionadas: Set<string>;
  onToggle: (codigo: string) => void;
  getLabel: (item: T) => string;
  getCategoryLabel: (categoria: string) => string;
}

export function SfPillByCategory<T extends PillItem>({
  grouped,
  selecionadas,
  onToggle,
  getLabel,
  getCategoryLabel,
}: SfPillByCategoryProps<T>) {
  const entries = Object.entries(grouped);
  if (entries.length === 0) return null;

  return (
    <div className="sf-pill-cat-groups">
      {entries.map(([categoria, opcoes]) => (
        <div key={categoria} className="sf-pill-cat-group">
          <p className="sf-pill-cat-group__title">{getCategoryLabel(categoria)}</p>
          <SfPillList
            items={opcoes}
            selecionadas={selecionadas}
            onToggle={onToggle}
            getLabel={getLabel}
          />
        </div>
      ))}
    </div>
  );
}
