import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/page/homePageComponents/SideBar";
import { useCriarReceita } from "../../hooks/UseReceita";
import { useBuscarRestricoesAlimentares } from "../../hooks/UseRestricaoAlimentar";
import { useListarCatalogoContextoReceita } from "../../hooks/UsePersonalizacao";
import { InformacoesBasicas } from "../../components/page/adicionarReceitaComponents/InformacoesBasicas";
import { ConteudoReceita } from "../../components/page/adicionarReceitaComponents/ConteudoReceita";
import { Restricoes } from "../../components/page/adicionarReceitaComponents/Restricoes";
import { Personalizacoes } from "../../components/page/adicionarReceitaComponents/Personalizacoes";
import type { TipoRefeicaoEnum } from "../../dto/enums/TipoRefeicaoEnum";
import type { PersonalizacaoResumoResponse } from "../../dto/personalizacao/response/PersonalizacaoResumoResponse";
import "./adicionarReceita.css";

export function AdicionarReceita() {
  const navigate = useNavigate();

  const { criar, loading: salvando, error: erroSalvar } = useCriarReceita();
  const { restricoes, loading: loadingRestricoes }      = useBuscarRestricoesAlimentares();
  const { personalizacoes, loading: loadingPersonalizacoes } = useListarCatalogoContextoReceita();
  const [titulo,          setTitulo]          = useState("");
  const [tipoRefeicao,    setTipoRefeicao]    = useState<TipoRefeicaoEnum | "">("");
  const [tempoPreparoMin, setTempoPreparoMin] = useState<number | "">("");
  const [qtdPorcoes,      setQtdPorcoes]      = useState<number | "">("");
  const [ingredientes,    setIngredientes]    = useState("");
  const [modoPreparo,     setModoPreparo]     = useState("");
  const [historia,        setHistoria]        = useState("");
  const [restricoesSelecionadas,      setRestricoesSelecionadas]      = useState<Set<string>>(new Set());
  const [personalizacoesSelecionadas, setPersonalizacoesSelecionadas] = useState<Set<string>>(new Set());

  const toggleItem = (set: Set<string>, setter: (s: Set<string>) => void) => (codigo: string) => {
    const novo = new Set(set);
  if (novo.has(codigo)) {
    novo.delete(codigo);
  } else {
    novo.add(codigo);
  }
  setter(novo);
  };

  const personalizacoesPorCategoria = personalizacoes.reduce<Record<string, PersonalizacaoResumoResponse[]>>(
    (acc, p) => {
      if (!acc[p.categoria]) acc[p.categoria] = [];
      acc[p.categoria].push(p);
      return acc;
    },
    {}
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tipoRefeicao) return;

    await criar(
      {
        titulo,
        tipoRefeicao,
        ingredientes,
        modoPreparo,
        historia:             historia             || undefined,
        tempoPreparoMin:      tempoPreparoMin      !== "" ? Number(tempoPreparoMin) : undefined,
        qtdPorcoes:           qtdPorcoes           !== "" ? Number(qtdPorcoes)      : undefined,
        restricoesAlimentares: Array.from(restricoesSelecionadas),
        personalizacoes:       Array.from(personalizacoesSelecionadas),
      },
      () => navigate(`/sabor-familia/home`)
    );
  };

  return (
    <div className="home-layout">
      <Sidebar />

      <main className="ar-main">
        <div className="ar-container">

          <form className="ar-form" onSubmit={handleSubmit}>

            <InformacoesBasicas
              titulo={titulo}                         onTituloChange={setTitulo}
              tipoRefeicao={tipoRefeicao}             onTipoRefeicaoChange={setTipoRefeicao}
              tempoPreparoMin={tempoPreparoMin}        onTempoPreparoMinChange={setTempoPreparoMin}
              qtdPorcoes={qtdPorcoes}                 onQtdPorcoesChange={setQtdPorcoes}
            />

            <ConteudoReceita
              ingredientes={ingredientes} onIngredientesChange={setIngredientes}
              modoPreparo={modoPreparo}   onModoPreparoChange={setModoPreparo}
              historia={historia}         onHistoriaChange={setHistoria}
            />

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

            {erroSalvar && (
              <div className="ar-form-error">{erroSalvar}</div>
            )}

            <div className="ar-form-actions">
              <button
                type="button"
                className="ar-btn ar-btn--ghost"
                onClick={() => navigate(-1)}
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="ar-btn ar-btn--primary"
                disabled={salvando}
              >
                {salvando ? "Publicando…" : "Publicar receita"}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}

export default AdicionarReceita;
