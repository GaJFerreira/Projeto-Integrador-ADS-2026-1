import "./configuracoes.css";
import "../home/homeSaborFamilia.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { useEditarPerfil, useBuscarMeuPerfil } from "../../hooks/UsePerfil";
import { useListarCatalogo, useListarCatalogoContextoPerfil } from "../../hooks/UsePersonalizacao";
import { useBuscarRestricoesAlimentares } from "../../hooks/UseRestricaoAlimentar";
import Sidebar from "../../components/page/homePageComponents/SideBar";
import { PerfilAvatar } from "../../components/common/PerfilAvatar";

export function Configuracoes() {
  const navigate = useNavigate();
  const { perfil, limparAuth } = useAuth();
  useBuscarMeuPerfil();
  const { editar, loading: salvando, error: erroEditar } = useEditarPerfil();
  const { catalogo: catalogoPersonalizacoes } = useListarCatalogo();
  const { personalizacoes: personalizacoesPerfil } = useListarCatalogoContextoPerfil();
  const { restricoes: catalogoRestricoes } = useBuscarRestricoesAlimentares();
  const [bio, setBio] = useState(perfil?.detalhes?.bio ?? "");
  const [fotoUrl, setFotoUrl] = useState(perfil?.detalhes?.fotoPerfilUrl ?? "");
  const [restricoesSelecionadas, setRestricoesSelecionadas] = useState<Set<string>>(new Set());
  const [personalizacoesSelecionadas, setPersonalizacoesSelecionadas] = useState<Set<string>>(new Set());
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    setBio(perfil?.detalhes?.bio ?? "");
    setFotoUrl(perfil?.detalhes?.fotoPerfilUrl ?? "");
  }, [perfil?.id, perfil?.detalhes?.bio, perfil?.detalhes?.fotoPerfilUrl]);

  const restricoesPerfilKey =
    perfil?.restricoesAlimentares?.map((r) => r.codigo).sort().join(",") ?? "";

  const personalizacoesPerfilKey = personalizacoesPerfil
    .map((p) => p.codigo)
    .sort()
    .join(",");

  useEffect(() => {
    if (!restricoesPerfilKey) return;
    setRestricoesSelecionadas(new Set(restricoesPerfilKey.split(",")));
  }, [restricoesPerfilKey]);

  useEffect(() => {
    if (!personalizacoesPerfilKey) return;
    setPersonalizacoesSelecionadas(new Set(personalizacoesPerfilKey.split(",")));
  }, [personalizacoesPerfilKey]);

  const handleSalvar = async () => {
    setSucesso(false);
    await editar(
      {
        bio: bio || undefined,
        fotoPerfilUrl: fotoUrl || undefined,
        restricoesAlimentares: Array.from(restricoesSelecionadas),
        personalizacoes: Array.from(personalizacoesSelecionadas),
      },
      async (perfilAtualizado) => {
        setSucesso(true);
        if (perfilAtualizado) {
          setBio(perfilAtualizado.detalhes?.bio ?? "");
          setFotoUrl(perfilAtualizado.detalhes?.fotoPerfilUrl ?? "");
        }
      }
    );
  };

  const handleLogout = () => {
    limparAuth(); // limpa perfil SF — sessão da plataforma permanece ativa
    navigate("/home");
  };

  const toggleRestriçao = (codigo: string) => {
    setRestricoesSelecionadas((prev) => {
      const next = new Set(prev);
      next.has(codigo) ? next.delete(codigo) : next.add(codigo);
      return next;
    });
  };

  const togglePersonalizacao = (codigo: string) => {
    setPersonalizacoesSelecionadas((prev) => {
      const next = new Set(prev);
      next.has(codigo) ? next.delete(codigo) : next.add(codigo);
      return next;
    });
  };

  return (
    <div className="home-layout">
      <Sidebar />

      <main className="config-main">
        <div className="config-container">

          {/* ── Perfil ── */}
          <section className="config-section">
            <p className="config-section__title">Meu Perfil</p>

            <div className="config-profile-header">
              <PerfilAvatar
                src={perfil?.detalhes?.fotoPerfilUrl}
                alt={perfil?.detalhes?.nome ?? "Perfil"}
                className="config-avatar"
                placeholderClassName="config-avatar config-avatar--placeholder"
              />

              <div className="config-profile-info">
                <p className="config-profile-name">{perfil?.detalhes?.nome ?? "—"}</p>
                <p className="config-profile-email">{perfil?.detalhes?.email ?? "—"}</p>
                <div className="config-profile-stats">
                  <span>
                    <strong>{perfil?.estatisticas?.countSeguidores ?? 0}</strong> seguidores
                  </span>
                  <span>
                    <strong>{perfil?.estatisticas?.countSeguindo ?? 0}</strong> seguindo
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="config-field">
              <label className="config-label">Bio</label>
              <textarea
                className="config-textarea"
                placeholder="Conte um pouco sobre você…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={300}
              />
            </div>

            {/* Foto URL */}
            <div className="config-field">
              <label className="config-label">URL da foto de perfil</label>
              <input
                className="config-input"
                type="url"
                placeholder="https://exemplo.com/foto.jpg"
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
              />
            </div>

            {sucesso && (
              <div className="config-success">✓ Perfil atualizado com sucesso!</div>
            )}
            {erroEditar && (
              <div className="config-error-msg">{erroEditar}</div>
            )}

            <div className="config-actions">
              <button
                className="config-btn config-btn--primary"
                onClick={handleSalvar}
                disabled={salvando}
              >
                {salvando ? "Salvando…" : "Salvar alterações"}
              </button>
            </div>
          </section>

          {/* ── Restrições alimentares ── */}
          <section className="config-section">
            <p className="config-section__title">Restrições Alimentares</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0, marginBottom: "1rem" }}>
              Marque suas restrições para que o app filtre receitas incompatíveis.
            </p>

            {catalogoRestricoes && catalogoRestricoes.length > 0 ? (
              <div className="config-tags">
                {catalogoRestricoes.map((r) => {
                  const ativa = restricoesSelecionadas.has(r.codigo);
                  return (
                    <button
                      key={r.codigo}
                      className={`config-tag config-tag--restricao`}
                      style={ativa ? { opacity: 1, fontWeight: 700 } : { opacity: 0.45 }}
                      onClick={() => toggleRestriçao(r.codigo)}
                      title={r.exemplos}
                    >
                      {ativa ? "✓ " : ""}{r.codigo}
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className="config-empty-tag">Nenhuma restrição disponível.</span>
            )}

            <div className="config-actions">
              <button
                className="config-btn config-btn--primary"
                onClick={handleSalvar}
                disabled={salvando}
              >
                {salvando ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </section>

          {/* ── Personalizações / Tags ── */}
          <section className="config-section">
            <p className="config-section__title">Tags & Preferências</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0, marginBottom: "1rem" }}>
              Personalize o seu perfil com tags que te representam.
            </p>

            {catalogoPersonalizacoes && catalogoPersonalizacoes.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {catalogoPersonalizacoes.map((grupo) => (
                  <div key={grupo.categoria}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", margin: "0 0 0.5rem", fontFamily: "var(--font-sans)" }}>
                      {grupo.categoria.replace(/_/g, " ")}
                    </p>
                    <div className="config-tags">
                      {grupo.opcoes.map((p) => {
                        const ativa = personalizacoesSelecionadas.has(p.codigo);
                        return (
                          <button
                            key={p.codigo}
                            className="config-tag config-tag--personalizacao"
                            style={ativa ? { opacity: 1, fontWeight: 700 } : { opacity: 0.45 }}
                            onClick={() => togglePersonalizacao(p.codigo)}
                          >
                            {ativa ? "✓ " : ""}#{p.codigo.replace(/^#/, "")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="config-empty-tag">Nenhuma tag disponível.</span>
            )}

            <div className="config-actions">
              <button
                className="config-btn config-btn--primary"
                onClick={handleSalvar}
                disabled={salvando}
              >
                {salvando ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </section>

          {/* ── Logout ── */}
          <div className="config-logout-section">
            <span className="config-logout-text">
              Deseja sair da sua conta Sabor da Família?
            </span>
            <button className="config-btn config-btn--danger" onClick={handleLogout}>
              Sair da conta
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Configuracoes;
