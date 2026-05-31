import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCriarPerfil } from "../../hooks/UsePerfil";
import { useBuscarRestricoesAlimentares } from "../../hooks/UseRestricaoAlimentar";
import { useListarCatalogoContextoPerfil } from "../../hooks/UsePersonalizacao";
import { useAuth } from "../../hooks/UseAuth";
import { CategoriaPersonalizacaoInfo } from "../../dto/enums/CategoriaPersonalizacaoEnum";
import type { PersonalizacaoResumoResponse } from "../../dto/personalizacao/response/PersonalizacaoResumoResponse";
import {
  labelPersonalizacao,
  labelRestricaoPerfil,
} from "../../utils/catalogoLabels";
import { SfPillByCategory, SfPillList } from "../../components/common/SfCatalogoPills";
import { isoParaBR } from "../../utils/dateUtils";
import { ImagemUploadField } from "../../components/common/ImagemUploadField";
import "./criarPerfil.css";

function toggleSet(set: Set<string>, setter: (s: Set<string>) => void) {
  return (codigo: string) => {
    const novo = new Set(set);
    if (novo.has(codigo)) {
      novo.delete(codigo);
    } else {
      novo.add(codigo);
    }
    setter(novo);
  };
}

export function CriarPerfil() {
  const navigate = useNavigate();
  const { salvarPerfil } = useAuth();

  const { criar, loading: salvando, error: erroSalvar } = useCriarPerfil();
  const { restricoes, loading: loadingRestricoes }       = useBuscarRestricoesAlimentares();
  const { personalizacoes, loading: loadingPersonalizacoes } = useListarCatalogoContextoPerfil();

  const [nome,            setNome]            = useState("");
  const [email,           setEmail]           = useState("");
  const [dataNascimento,  setDataNascimento]  = useState("");
  const [bio,          setBio]          = useState("");
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [restricoesSelecionadas,      setRestricoesSelecionadas]      = useState<Set<string>>(new Set());
  const [personalizacoesSelecionadas, setPersonalizacoesSelecionadas] = useState<Set<string>>(new Set());

  const personalizacoesPorCategoria = personalizacoes.reduce<
    Record<string, PersonalizacaoResumoResponse[]>
  >((acc, p) => {
    if (!acc[p.categoria]) acc[p.categoria] = [];
    acc[p.categoria].push(p);
    return acc;
  }, {});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await criar(
      {
        nome,
        email,
        dataNascimento:       isoParaBR(dataNascimento),
        bio:                  bio          || undefined,
        restricoesAlimentares: Array.from(restricoesSelecionadas),
        personalizacoes:       Array.from(personalizacoesSelecionadas),
      },
      fotoPerfil,
      (perfil) => {
        salvarPerfil(perfil);
        navigate("/sabor-familia/home");
      }
    );
  };

  return (
    <div className="cp-container">
      <div className="cp-card">

        {/* Cabeçalho */}
        <div className="cp-logo">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={36} height={36}>
            <circle cx="20" cy="20" r="18" fill="#BA7517" opacity="0.15" />
            <path d="M20 8 C14 8 10 13 10 18 C10 24 15 28 20 32 C25 28 30 24 30 18 C30 13 26 8 20 8Z"
              fill="#BA7517" opacity="0.7" />
            <circle cx="20" cy="18" r="5" fill="#BA7517" />
          </svg>
        </div>
        <h1>Sabor da Família</h1>
        <p>Crie seu perfil para começar</p>

        <form onSubmit={handleSubmit}>

          {/* ── Dados básicos ── */}
          <div className="field">
            <label>Nome completo</label>
            <input
              placeholder="Ex: Maria Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Data de nascimento</label>
            <input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Bio <span className="cp-optional">(opcional)</span></label>
            <textarea
              className="cp-textarea"
              placeholder="Fale um pouco sobre você e sua relação com a cozinha…"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="field">
            <ImagemUploadField
              label="Foto de perfil (opcional)"
              arquivo={fotoPerfil}
              onArquivoChange={setFotoPerfil}
              disabled={salvando}
            />
          </div>

          {/* ── Restrições alimentares ── */}
          <div className="cp-section">
            <span className="cp-section__label">
              Restrições alimentares <span className="cp-optional">(opcional)</span>
            </span>

            {loadingRestricoes ? (
              <span className="cp-loading-sm">Carregando…</span>
            ) : (
              <SfPillList
                items={restricoes}
                selecionadas={restricoesSelecionadas}
                onToggle={toggleSet(restricoesSelecionadas, setRestricoesSelecionadas)}
                getLabel={labelRestricaoPerfil}
              />
            )}
          </div>

          {/* ── Personalizações ── */}
          <div className="cp-section">
            <span className="cp-section__label">
              Personalizações <span className="cp-optional">(opcional)</span>
            </span>

            {loadingPersonalizacoes ? (
              <span className="cp-loading-sm">Carregando…</span>
            ) : (
              <SfPillByCategory
                grouped={personalizacoesPorCategoria}
                selecionadas={personalizacoesSelecionadas}
                onToggle={toggleSet(personalizacoesSelecionadas, setPersonalizacoesSelecionadas)}
                getLabel={(p) => labelPersonalizacao(p, "perfil")}
                getCategoryLabel={(cat) =>
                  CategoriaPersonalizacaoInfo[cat as keyof typeof CategoriaPersonalizacaoInfo]
                    ?.label ?? cat
                }
              />
            )}
          </div>

          {erroSalvar && <p className="error">{erroSalvar}</p>}

          <button className="btn-submit" type="submit" disabled={salvando}>
            {salvando ? "Criando perfil…" : "Criar perfil"}
          </button>

          <p className="cp-login-link">
            Já tem um perfil?{" "}
            <button type="button" className="cp-link-btn" onClick={() => navigate("/sabor-familia/login")}>
              Entrar
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default CriarPerfil;
