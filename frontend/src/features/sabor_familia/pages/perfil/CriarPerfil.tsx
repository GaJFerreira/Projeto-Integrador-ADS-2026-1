import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCriarPerfil } from "../../hooks/UsePerfil";
import { useBuscarRestricoesAlimentares } from "../../hooks/UseRestricaoAlimentar";
import { useListarCatalogo } from "../../hooks/UsePersonalizacao";
import { useAuth } from "../../hooks/UseAuth";
import { CategoriaPersonalizacaoInfo } from "../../dto/enums/CategoriaPersonalizacaoEnum";
import type { CategoriaPersonalizacaoEnum } from "../../dto/enums/CategoriaPersonalizacaoEnum";
import {
  labelPersonalizacao,
  labelRestricaoPerfil,
} from "../../utils/catalogoLabels";
import { SfPillByCategory, SfPillList } from "../../components/common/SfCatalogoPills";
import { isoParaBR } from "../../utils/dateUtils";
import { ImagemUploadField } from "../../components/common/ImagemUploadField";
import "../home/homeSaborFamilia.css";
import "./criarPerfil.css";

function lerDadosUsuarioPlataforma(): { nome: string; email: string } {
  try {
    const user = JSON.parse(localStorage.getItem("user") ?? "null");
    return {
      nome: typeof user?.name === "string" ? user.name : "",
      email: typeof user?.email === "string" ? user.email : "",
    };
  } catch {
    return { nome: "", email: "" };
  }
}

export function CriarPerfil() {
  const navigate = useNavigate();
  const { salvarPerfil } = useAuth();
  const dadosPlataforma = useMemo(() => lerDadosUsuarioPlataforma(), []);

  const { criar, loading: salvando, error: erroSalvar } = useCriarPerfil();
  const { restricoes: catalogoRestricoes, loading: loadingRestricoes } =
    useBuscarRestricoesAlimentares();
  const { catalogo: catalogoPersonalizacoes, loading: loadingPersonalizacoes } =
    useListarCatalogo();

  const [nome, setNome] = useState(dadosPlataforma.nome);
  const [email, setEmail] = useState(dadosPlataforma.email);
  const [dataNascimento, setDataNascimento] = useState("");
  const [bio, setBio] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [restricoesSelecionadas, setRestricoesSelecionadas] = useState<Set<string>>(
    new Set()
  );
  const [personalizacoesSelecionadas, setPersonalizacoesSelecionadas] = useState<
    Set<string>
  >(new Set());

  const temDadosPlataforma = Boolean(dadosPlataforma.nome && dadosPlataforma.email);

  const personalizacoesPorCategoria = useMemo(
    () =>
      Object.fromEntries(
        (catalogoPersonalizacoes ?? []).map((grupo) => [grupo.categoria, grupo.opcoes])
      ),
    [catalogoPersonalizacoes]
  );

  const toggleRestricao = (codigo: string) => {
    setRestricoesSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(codigo)) next.delete(codigo);
      else next.add(codigo);
      return next;
    });
  };

  const togglePersonalizacao = (codigo: string) => {
    setPersonalizacoesSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(codigo)) next.delete(codigo);
      else next.add(codigo);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await criar(
      {
        nome,
        email,
        dataNascimento: isoParaBR(dataNascimento),
        bio: bio || undefined,
        restricoesAlimentares: Array.from(restricoesSelecionadas),
        personalizacoes: Array.from(personalizacoesSelecionadas),
      },
      fotoPerfil,
      (perfil) => {
        salvarPerfil(perfil);
        navigate("/sabor-familia/home");
      }
    );
  };

  return (
    <main className="cp-main">
      <div className="cp-container">
        <header className="cp-header">
          <p className="cp-eyebrow">Sabor da Família</p>
          <h1 className="cp-title">Criar perfil</h1>
          <p className="cp-subtitle">
            Complete seu cadastro para publicar e descobrir receitas em família.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <section className="config-section">
            <h2 className="config-section__title">Seus dados</h2>
            <p className="config-section__desc">
              {temDadosPlataforma
                ? "Nome e e-mail foram preenchidos com os dados da sua conta na plataforma."
                : "Informe nome e e-mail para criar seu perfil."}
            </p>

            {temDadosPlataforma ? (
              <div className="config-profile-header cp-profile-header--cadastro">
                <div className="cp-profile-avatar-placeholder" aria-hidden="true">
                  {nome.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="config-profile-info">
                  <p className="config-profile-name">{nome}</p>
                  <p className="config-profile-email">{email}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="config-field">
                  <label className="config-label" htmlFor="cp-nome">
                    Nome completo
                  </label>
                  <input
                    id="cp-nome"
                    className="config-input"
                    placeholder="Ex: Maria Silva"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                <div className="config-field">
                  <label className="config-label" htmlFor="cp-email">
                    E-mail
                  </label>
                  <input
                    id="cp-email"
                    type="email"
                    className="config-input"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="config-field">
              <label className="config-label" htmlFor="cp-nascimento">
                Data de nascimento
              </label>
              <input
                id="cp-nascimento"
                type="date"
                className="config-input"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                required
              />
            </div>

            <div className="config-field">
              <label className="config-label" htmlFor="cp-bio">
                Bio <span className="cp-optional">(opcional)</span>
              </label>
              <textarea
                id="cp-bio"
                className="config-textarea"
                placeholder="Fale um pouco sobre você e sua relação com a cozinha…"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={300}
              />
            </div>

            <div className="config-field">
              <ImagemUploadField
                label="Foto de perfil (opcional)"
                arquivo={fotoPerfil}
                onArquivoChange={setFotoPerfil}
                disabled={salvando}
              />
            </div>
          </section>

          <section className="config-section">
            <h2 className="config-section__title">Restrições alimentares</h2>
            <p className="config-section__desc">
              Marque suas restrições para que o app filtre receitas incompatíveis.
            </p>

            {loadingRestricoes ? (
              <span className="cp-loading">Carregando…</span>
            ) : (
              <SfPillList
                items={catalogoRestricoes ?? []}
                selecionadas={restricoesSelecionadas}
                onToggle={toggleRestricao}
                getLabel={labelRestricaoPerfil}
                getTitle={(r) => r.exemplos}
                emptyMessage="Nenhuma restrição disponível."
              />
            )}
          </section>

          <section className="config-section">
            <h2 className="config-section__title">Preferências</h2>
            <p className="config-section__desc">
              Personalize o seu perfil com tags que te representam.
            </p>

            {loadingPersonalizacoes ? (
              <span className="cp-loading">Carregando…</span>
            ) : catalogoPersonalizacoes && catalogoPersonalizacoes.length > 0 ? (
              <SfPillByCategory
                grouped={personalizacoesPorCategoria}
                selecionadas={personalizacoesSelecionadas}
                onToggle={togglePersonalizacao}
                getLabel={(p) => labelPersonalizacao(p, "perfil")}
                getCategoryLabel={(cat) =>
                  CategoriaPersonalizacaoInfo[cat as CategoriaPersonalizacaoEnum]?.label ??
                  cat
                }
              />
            ) : (
              <span className="sf-pill-empty">Nenhuma tag disponível.</span>
            )}
          </section>

          {erroSalvar && <p className="cp-error">{erroSalvar}</p>}

          <div className="cp-actions">
            <button
              className="config-btn config-btn--primary"
              type="submit"
              disabled={salvando}
            >
              {salvando ? "Criando perfil…" : "Criar perfil"}
            </button>
          </div>

          <p className="cp-login-link">
            Já tem um perfil?{" "}
            <button
              type="button"
              className="cp-link-btn"
              onClick={() => navigate("/sabor-familia/login")}
            >
              Entrar
            </button>
          </p>
        </form>
      </div>
    </main>
  );
}

export default CriarPerfil;
