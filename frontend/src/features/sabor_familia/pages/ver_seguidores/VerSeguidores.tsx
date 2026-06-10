import "./verSeguidores.css";
import "../home/homeSaborFamilia.css";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBuscarSeguidores, useBuscarSeguindo } from "../../hooks/UsePerfil";
import type { PerfilResumoResponse } from "../../dto/perfil/response/PerfilResumoResponse";
import type { PageResponse } from "../../dto/page/PageResponse";
import { PerfilItem } from "../../components/page/verSeguidoresComponentes/PerfilItem";
import { BotaoVoltar } from "../../components/common/BotaoVoltar";

const PERFIS_POR_PAGINA = 20;

function useListaPerfisPaginada(
  perfilId: number,
  pageData: PageResponse<PerfilResumoResponse> | null,
  loading: boolean
) {
  const [lista, setLista] = useState<PerfilResumoResponse[]>([]);
  const paginasMescladas = useRef(new Set<number>());

  useEffect(() => {
    setLista([]);
    paginasMescladas.current.clear();
  }, [perfilId]);

  useEffect(() => {
    if (!pageData?.content || loading) return;

    const pageNumber = pageData.number;
    if (paginasMescladas.current.has(pageNumber)) return;
    paginasMescladas.current.add(pageNumber);

    if (pageNumber === 0) {
      setLista(pageData.content);
      return;
    }

    setLista((prev) => {
      const ids = new Set(prev.map((p) => p.perfilId));
      return [
        ...prev,
        ...pageData.content.filter((p) => !ids.has(p.perfilId)),
      ];
    });
  }, [pageData, loading]);

  return lista;
}

function ListaPerfisPaginada({
  titulo,
  vazio,
  perfilId,
  page,
  setPage,
  pageData,
  loading,
  error,
}: {
  titulo: string;
  vazio: string;
  perfilId: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pageData: PageResponse<PerfilResumoResponse> | null;
  loading: boolean;
  error: string | null;
}) {
  const navigate = useNavigate();
  const lista = useListaPerfisPaginada(perfilId, pageData, loading);
  const total = pageData?.totalElements ?? 0;
  const temMais = pageData ? !pageData.last : false;
  const carregandoMais = loading && page > 0;

  return (
    <main className="lista-perfis-main">
      <div className="lista-perfis-content">
        <BotaoVoltar
          destino="perfil"
          onClick={() =>
            navigate(`/sabor-familia/perfil/${perfilId}`, { replace: true })
          }
          className="lista-perfis-voltar"
        />

        <div className="lista-perfis-header">
          <h2 className="lista-perfis-title">{titulo}</h2>
          {!loading && total > 0 && (
            <span className="lista-perfis-count">{total}</span>
          )}
        </div>

        {loading && page === 0 && (
          <div className="home-loading">
            <div className="home-loading__spinner" />
            <span>Carregando…</span>
          </div>
        )}

        {error && <div className="home-error">{error}</div>}

        {!loading && !error && lista.length === 0 && (
          <div className="lista-perfis-empty">
            <p>{vazio}</p>
          </div>
        )}

        {lista.length > 0 && (
          <div className="lista-perfis-list">
            {lista.map((p) => (
              <PerfilItem key={p.perfilId} perfil={p} />
            ))}
          </div>
        )}

        {carregandoMais && (
          <div className="home-loading lista-perfis-loading-more">
            <div className="home-loading__spinner" />
            <span>Carregando mais…</span>
          </div>
        )}

        {!loading && temMais && (
          <button
            className="lista-perfis-load-more"
            onClick={() => setPage((p) => p + 1)}
            type="button"
          >
            Carregar mais
          </button>
        )}
      </div>
    </main>
  );
}

export function VerSeguidores() {
  const { perfilId } = useParams<{ perfilId: string }>();
  const id = Number(perfilId);
  const [page, setPage] = useState(0);
  const { seguidores, loading, error } = useBuscarSeguidores(id, page, PERFIS_POR_PAGINA);

  useEffect(() => {
    setPage(0);
  }, [id]);

  if (Number.isNaN(id)) {
    return (
      <main className="lista-perfis-main">
        <div className="home-error">Perfil inválido.</div>
      </main>
    );
  }

  return (
    <ListaPerfisPaginada
      titulo="Seguidores"
        vazio="Nenhum seguidor ainda."
        perfilId={id}
        page={page}
        setPage={setPage}
        pageData={seguidores}
        loading={loading}
        error={error}
    />
  );
}

export function VerSeguindo() {
  const { perfilId } = useParams<{ perfilId: string }>();
  const id = Number(perfilId);
  const [page, setPage] = useState(0);
  const { seguindo, loading, error } = useBuscarSeguindo(id, page, PERFIS_POR_PAGINA);

  useEffect(() => {
    setPage(0);
  }, [id]);

  if (Number.isNaN(id)) {
    return (
      <main className="lista-perfis-main">
        <div className="home-error">Perfil inválido.</div>
      </main>
    );
  }

  return (
    <ListaPerfisPaginada
      titulo="Seguindo"
        vazio="Este perfil não segue ninguém ainda."
        perfilId={id}
        page={page}
        setPage={setPage}
        pageData={seguindo}
        loading={loading}
        error={error}
    />
  );
}
