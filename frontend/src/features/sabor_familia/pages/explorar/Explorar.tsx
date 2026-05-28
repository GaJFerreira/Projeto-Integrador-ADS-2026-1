import "./explorar.css";
import "../home/homeSaborFamilia.css";
import { useState, useCallback } from "react";
import { useExplorarReceitas } from "../../hooks/UseReceita";
import type { ReceitaResumoResponse } from "../../dto/receita/response/ReceitaResumoResponse";
import type { TipoRefeicaoEnum } from "../../dto/enums/TipoRefeicaoEnum";
import { ExplorarReceitaFocus } from "../../components/page/explorarComponents/ExplorarReceitaFocus";
import { ExplorarCard } from "../../components/page/explorarComponents/ExplorarCard";
import Sidebar from "../../components/page/homePageComponents/SideBar";
import SearchIcon from "../../icon/menu/SearchIcon";

const TIPO_LABELS: Record<TipoRefeicaoEnum, string> = {
  CAFE_DA_MANHA: "Café da manhã",
  ALMOCO:        "Almoço",
  LANCHE:        "Lanche",
  JANTAR:        "Jantar",
  SOBREMESA:     "Sobremesa",
  OUTRO:         "Outro",
};

export function Explorar() {
  const [titulo, setTitulo] = useState("");
  const [tipoRefeicao, setTipoRefeicao] = useState<TipoRefeicaoEnum | "">("");
  const [page, setPage] = useState(0);
  const [allReceitas, setAllReceitas] = useState<ReceitaResumoResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const { receitas, loading, error } = useExplorarReceitas(
    page,
    20,
    busca || undefined,
    tipoRefeicao || undefined
  );
  const paginaAtual = receitas?.content ?? [];
  const totalPages = receitas?.totalPages ?? 1;
  const temMais = page + 1 < totalPages;

  const handleSearch = useCallback((valor: string) => {
    setTitulo(valor);
    setPage(0);
    setAllReceitas([]);
    setBusca(valor);
  }, []);

  const handleTipo = useCallback((valor: TipoRefeicaoEnum | "") => {
    setTipoRefeicao(valor);
    setPage(0);
    setAllReceitas([]);
  }, []);

  const listaFinal = page === 0
    ? paginaAtual
    : [...allReceitas, ...paginaAtual.filter(r => !allReceitas.find(a => a.id === r.id))];

  const handleCarregarMais = () => {
    setAllReceitas(listaFinal);
    setPage((p) => p + 1);
  };

  if (selectedId !== null) {
    return (
      <ExplorarReceitaFocus
        receitaId={selectedId}
        onVoltar={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="home-layout">
      <Sidebar />

      <main className="explorar-main">
        {/* ── Filtros ── */}
        <div className="explorar-filters">
          <div className="explorar-search-wrap">
            <SearchIcon />
            <input
              className="explorar-search"
              type="text"
              placeholder="Buscar receita por nome…"
              value={titulo}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <select
            className="explorar-select"
            value={tipoRefeicao}
            onChange={(e) => handleTipo(e.target.value as TipoRefeicaoEnum | "")}
          >
            <option value="">Todos os tipos</option>
            {(Object.keys(TIPO_LABELS) as TipoRefeicaoEnum[]).map((tipo) => (
              <option key={tipo} value={tipo}>
                {TIPO_LABELS[tipo]}
              </option>
            ))}
          </select>
        </div>

        {/* ── Estado de carregamento ── */}
        {loading && page === 0 && (
          <div className="explorar-loading">
            <div className="explorar-spinner" />
            <span>Buscando receitas…</span>
          </div>
        )}

        {error && (
          <div className="explorar-error">{error}</div>
        )}

        {/* ── Contagem ── */}
        {!loading && !error && receitas && (
          <p className="explorar-count">
            {receitas.totalElements} receita{receitas.totalElements !== 1 ? "s" : ""} encontrada{receitas.totalElements !== 1 ? "s" : ""}
          </p>
        )}

        {/* ── Lista vazia ── */}
        {!loading && !error && listaFinal.length === 0 && (
          <div className="explorar-empty">
            <p>Nenhuma receita encontrada.</p>
            <p>Tente buscar por outro nome ou tipo de refeição.</p>
          </div>
        )}

        {/* ── Grid de receitas ── */}
        <div className="explorar-grid">
          {listaFinal.map((receita) => (
            <ExplorarCard
              key={receita.id}
              receita={receita}
              isSelected={false}
              onClick={() => setSelectedId(receita.id)}
            />
          ))}
        </div>

        {/* ── Carregar mais ── */}
        {!loading && temMais && (
          <button className="explorar-load-more" onClick={handleCarregarMais}>
            Carregar mais
          </button>
        )}

        {loading && page > 0 && (
          <div className="explorar-loading" style={{ margin: "1rem auto" }}>
            <div className="explorar-spinner" />
          </div>
        )}
      </main>

    </div>
  );
}

export default Explorar;
