import "./explorar.css";
import "../home/homeSaborFamilia.css";
import { useState, useCallback } from "react";
import { useExplorarReceitas } from "../../hooks/UseReceita";
import { useExplorarPerfis } from "../../hooks/UsePerfil";
import type { ReceitaResumoResponse } from "../../dto/receita/response/ReceitaResumoResponse";
import type { PerfilResumoResponse } from "../../dto/perfil/response/PerfilResumoResponse";
import type { TipoRefeicaoEnum } from "../../dto/enums/TipoRefeicaoEnum";
import { ExplorarReceitaFocus } from "../../components/page/explorarComponents/ExplorarReceitaFocus";
import { ExplorarCard } from "../../components/page/explorarComponents/ExplorarCard";
import { ExplorarPerfilCard } from "../../components/page/explorarComponents/ExplorarPerfilCard";
import {
  ExplorarSegmentedSwitch,
  type ExplorarModo,
} from "../../components/page/explorarComponents/ExplorarSegmentedSwitch";
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
  const [modo, setModo] = useState<ExplorarModo>("receitas");
  const [titulo, setTitulo] = useState("");
  const [tipoRefeicao, setTipoRefeicao] = useState<TipoRefeicaoEnum | "">("");
  const [page, setPage] = useState(0);
  const [allReceitas, setAllReceitas] = useState<ReceitaResumoResponse[]>([]);
  const [allPerfis, setAllPerfis] = useState<PerfilResumoResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busca, setBusca] = useState("");

  const isReceitas = modo === "receitas";

  const { receitas, loading: loadingReceitas, error: errorReceitas } = useExplorarReceitas(
    page,
    20,
    busca || undefined,
    tipoRefeicao || undefined,
    isReceitas
  );

  const { perfis, loading: loadingPerfis, error: errorPerfis } = useExplorarPerfis(
    page,
    20,
    busca || undefined,
    !isReceitas
  );

  const paginaReceitas = receitas?.content ?? [];
  const paginaPerfis = perfis?.content ?? [];
  const totalPages = isReceitas
    ? (receitas?.totalPages ?? 1)
    : (perfis?.totalPages ?? 1);
  const totalElements = isReceitas
    ? (receitas?.totalElements ?? 0)
    : (perfis?.totalElements ?? 0);
  const temMais = page + 1 < totalPages;
  const loading = isReceitas ? loadingReceitas : loadingPerfis;
  const error = isReceitas ? errorReceitas : errorPerfis;

  const handleModo = useCallback((novoModo: ExplorarModo) => {
    if (novoModo === modo) return;
    setModo(novoModo);
    setPage(0);
    setAllReceitas([]);
    setAllPerfis([]);
    setSelectedId(null);
  }, [modo]);

  const handleSearch = useCallback((valor: string) => {
    setTitulo(valor);
    setPage(0);
    setAllReceitas([]);
    setAllPerfis([]);
    setBusca(valor);
  }, []);

  const handleTipo = useCallback((valor: TipoRefeicaoEnum | "") => {
    setTipoRefeicao(valor);
    setPage(0);
    setAllReceitas([]);
  }, []);

  const listaReceitas = page === 0
    ? paginaReceitas
    : [...allReceitas, ...paginaReceitas.filter((r) => !allReceitas.find((a) => a.id === r.id))];

  const listaPerfis = page === 0
    ? paginaPerfis
    : [...allPerfis, ...paginaPerfis.filter((p) => !allPerfis.find((a) => a.perfilId === p.perfilId))];

  const handleCarregarMais = () => {
    if (isReceitas) {
      setAllReceitas(listaReceitas);
    } else {
      setAllPerfis(listaPerfis);
    }
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
    <main className="explorar-main">
        <ExplorarSegmentedSwitch modo={modo} onChange={handleModo} />

        <div className="explorar-filters">
          <div className="explorar-search-wrap">
            <SearchIcon />
            <input
              className="explorar-search"
              type="text"
              placeholder={
                isReceitas
                  ? "Buscar receita por nome…"
                  : "Buscar perfil por nome…"
              }
              value={titulo}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {isReceitas && (
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
          )}
        </div>

        {loading && page === 0 && (
          <div className="explorar-loading">
            <div className="explorar-spinner" />
            <span>{isReceitas ? "Buscando receitas…" : "Buscando perfis…"}</span>
          </div>
        )}

        {error && (
          <div className="explorar-error">{error}</div>
        )}

        {!loading && !error && (
          <p className="explorar-count">
            {totalElements}{" "}
            {isReceitas
              ? `receita${totalElements !== 1 ? "s" : ""} encontrada${totalElements !== 1 ? "s" : ""}`
              : `perfil${totalElements !== 1 ? "is" : ""} encontrado${totalElements !== 1 ? "s" : ""}`}
          </p>
        )}

        {!loading && !error && (isReceitas ? listaReceitas.length === 0 : listaPerfis.length === 0) && (
          <div className="explorar-empty">
            <p>{isReceitas ? "Nenhuma receita encontrada." : "Nenhum perfil encontrado."}</p>
            <p>
              {isReceitas
                ? "Tente buscar por outro nome ou tipo de refeição."
                : "Tente buscar por outro nome."}
            </p>
          </div>
        )}

        {isReceitas ? (
          <div className="explorar-grid">
            {listaReceitas.map((receita) => (
              <ExplorarCard
                key={receita.id}
                receita={receita}
                isSelected={false}
                onClick={() => setSelectedId(receita.id)}
              />
            ))}
          </div>
        ) : (
          <div className="explorar-grid explorar-grid--perfis">
            {listaPerfis.map((perfil) => (
              <ExplorarPerfilCard key={perfil.perfilId} perfil={perfil} />
            ))}
          </div>
        )}

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
  );
}

export default Explorar;
