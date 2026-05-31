import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { useBuscarReceita, useEditarReceita } from "../../hooks/UseReceita";
import { useBuscarRestricoesAlimentares } from "../../hooks/UseRestricaoAlimentar";
import { useListarCatalogoContextoReceita } from "../../hooks/UsePersonalizacao";
import { useMidiaUrl } from "../../hooks/UseMidia";
import { InformacoesBasicas } from "../../components/page/adicionarReceitaComponents/InformacoesBasicas";
import { ConteudoReceita } from "../../components/page/adicionarReceitaComponents/ConteudoReceita";
import { Restricoes } from "../../components/page/adicionarReceitaComponents/Restricoes";
import { Personalizacoes } from "../../components/page/adicionarReceitaComponents/Personalizacoes";
import { ImagemUploadField } from "../../components/common/ImagemUploadField";
import { ContextoMidiaReceita } from "../../dto/enums/ContextoMidiaEnum";
import type { TipoRefeicaoEnum } from "../../dto/enums/TipoRefeicaoEnum";
import type { PersonalizacaoResumoResponse } from "../../dto/personalizacao/response/PersonalizacaoResumoResponse";
import "./adicionarReceita.css";

export function EditarReceita() {
  const navigate = useNavigate();
  const { receitaId: receitaIdParam } = useParams<{ receitaId: string }>();
  const receitaId = Number(receitaIdParam);
  const { perfilId } = useAuth();

  const { receita, loading: carregando, error: erroCarregar } = useBuscarReceita(receitaId);
  const { editar, loading: salvando, error: erroSalvar, fieldErrors, limparErro } =
    useEditarReceita();
  const erroBannerRef = useRef<HTMLDivElement>(null);
  const { restricoes, loading: loadingRestricoes } = useBuscarRestricoesAlimentares();
  const { personalizacoes, loading: loadingPersonalizacoes } = useListarCatalogoContextoReceita();

  const [titulo, setTitulo] = useState("");
  const [tipoRefeicao, setTipoRefeicao] = useState<TipoRefeicaoEnum | "">("");
  const [tempoPreparoMin, setTempoPreparoMin] = useState<number | "">("");
  const [qtdPorcoes, setQtdPorcoes] = useState<number | "">("");
  const [ingredientes, setIngredientes] = useState("");
  const [modoPreparo, setModoPreparo] = useState("");
  const [historia, setHistoria] = useState("");
  const [fotoReceita, setFotoReceita] = useState<File | null>(null);
  const [restricoesSelecionadas, setRestricoesSelecionadas] = useState<Set<string>>(new Set());
  const [personalizacoesSelecionadas, setPersonalizacoesSelecionadas] =
    useState<Set<string>>(new Set());
  const [formularioPreenchido, setFormularioPreenchido] = useState(false);

  const { url: previewCapa } = useMidiaUrl(
    "receita",
    receita?.id,
    ContextoMidiaReceita.CAPA_FEED,
    receita?.possuiMidia
  );

  const toggleItem =
    (set: Set<string>, setter: (s: Set<string>) => void) => (codigo: string) => {
      const novo = new Set(set);
      if (novo.has(codigo)) {
        novo.delete(codigo);
      } else {
        novo.add(codigo);
      }
      setter(novo);
    };

  const personalizacoesPorCategoria = personalizacoes.reduce<
    Record<string, PersonalizacaoResumoResponse[]>
  >((acc, p) => {
    if (!acc[p.categoria]) acc[p.categoria] = [];
    acc[p.categoria].push(p);
    return acc;
  }, {});

  useEffect(() => {
    if (!receita || formularioPreenchido) return;

    setTitulo(receita.detalhes.titulo);
    setTipoRefeicao(receita.detalhes.tipoRefeicao);
    setTempoPreparoMin(receita.detalhes.tempoPreparoMin ?? "");
    setQtdPorcoes(receita.detalhes.qtdPorcoes ?? "");
    setIngredientes(receita.detalhes.ingredientes);
    setModoPreparo(receita.detalhes.modoPreparo);
    setHistoria(receita.detalhes.historia ?? "");
    setRestricoesSelecionadas(
      new Set(receita.restricoesAlimentares.map((r) => r.codigo))
    );
    setPersonalizacoesSelecionadas(
      new Set(receita.personalizacao.map((p) => p.codigo))
    );
    setFormularioPreenchido(true);
  }, [receita, formularioPreenchido]);

  useEffect(() => {
    if (erroSalvar && erroBannerRef.current) {
      erroBannerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [erroSalvar]);

  const naoAutor =
    receita &&
    perfilId !== null &&
    receita.autor.perfilId !== perfilId;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tipoRefeicao || !receita) return;

    limparErro();

    await editar(
      receita.id,
      {
        titulo,
        tipoRefeicao,
        ingredientes,
        modoPreparo,
        historia: historia || undefined,
        tempoPreparoMin: tempoPreparoMin !== "" ? Number(tempoPreparoMin) : undefined,
        qtdPorcoes: qtdPorcoes !== "" ? Number(qtdPorcoes) : undefined,
        restricoesAlimentares: Array.from(restricoesSelecionadas),
        personalizacoes: Array.from(personalizacoesSelecionadas),
      },
      fotoReceita,
      () => navigate(`/sabor-familia/home`)
    );
  };

  if (isNaN(receitaId)) {
    return (
      <main className="ar-main">
        <div className="ar-container home-error">Receita inválida.</div>
      </main>
    );
  }

  if (carregando) {
    return (
      <main className="ar-main">
        <div className="ar-container home-loading">
          <div className="home-loading__spinner" />
          <span>Carregando receita…</span>
        </div>
      </main>
    );
  }

  if (erroCarregar || !receita) {
    return (
      <main className="ar-main">
        <div className="ar-container home-error">
          {erroCarregar ?? "Receita não encontrada."}
        </div>
      </main>
    );
  }

  if (naoAutor) {
    return (
      <main className="ar-main">
        <div className="ar-container home-error">
          Você não pode editar esta receita.
        </div>
      </main>
    );
  }

  return (
    <main className="ar-main">
      <div className="ar-container">
        <header className="ar-header">
          <p className="ar-eyebrow">Editar</p>
          <h1 className="ar-title">Editar receita</h1>
          <p className="ar-subtitle">Atualize os dados da sua publicação.</p>
        </header>

        <form className="ar-form" onSubmit={handleSubmit}>
          {erroSalvar && (
            <div ref={erroBannerRef} className="ar-form-error" role="alert">
              {erroSalvar}
            </div>
          )}

          <InformacoesBasicas
            titulo={titulo}
            onTituloChange={setTitulo}
            tipoRefeicao={tipoRefeicao}
            onTipoRefeicaoChange={setTipoRefeicao}
            tempoPreparoMin={tempoPreparoMin}
            onTempoPreparoMinChange={setTempoPreparoMin}
            qtdPorcoes={qtdPorcoes}
            onQtdPorcoesChange={setQtdPorcoes}
            errosCampo={fieldErrors}
          />

          <ConteudoReceita
            ingredientes={ingredientes}
            onIngredientesChange={setIngredientes}
            modoPreparo={modoPreparo}
            onModoPreparoChange={setModoPreparo}
            historia={historia}
            onHistoriaChange={setHistoria}
            errosCampo={fieldErrors}
          />

          <section className="ar-section">
            <h2 className="ar-section__title">Foto da receita</h2>
            <ImagemUploadField
              label="Nova imagem de capa (opcional)"
              hint="Deixe em branco para manter a foto atual. JPEG ou PNG, até 1,5 MB."
              arquivo={fotoReceita}
              onArquivoChange={setFotoReceita}
              previewUrl={previewCapa}
              disabled={salvando}
            />
          </section>

          <Restricoes
            restricoes={restricoes}
            loading={loadingRestricoes}
            selecionadas={restricoesSelecionadas}
            onToggle={toggleItem(restricoesSelecionadas, setRestricoesSelecionadas)}
          />

          <Personalizacoes
            personalizacoesPorCategoria={personalizacoesPorCategoria}
            loading={loadingPersonalizacoes}
            selecionadas={personalizacoesSelecionadas}
            onToggle={toggleItem(personalizacoesSelecionadas, setPersonalizacoesSelecionadas)}
          />

          <div className="ar-form-actions">
            <button
              type="button"
              className="ar-btn ar-btn--ghost"
              onClick={() => navigate(-1)}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button type="submit" className="ar-btn ar-btn--primary" disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditarReceita;
