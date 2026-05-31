import "./configuracoes.css";
import "../home/homeSaborFamilia.css";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { useEditarPerfil, useBuscarMeuPerfil } from "../../hooks/UsePerfil";
import { useListarCatalogo } from "../../hooks/UsePersonalizacao";
import { useBuscarRestricoesAlimentares } from "../../hooks/UseRestricaoAlimentar";
import { ContextoMidiaPerfil } from "../../dto/enums/ContextoMidiaEnum";
import { PerfilAvatar } from "../../components/common/PerfilAvatar";
import { ImagemUploadField } from "../../components/common/ImagemUploadField";
import {
  labelPersonalizacao,
  labelRestricaoPerfil,
} from "../../utils/catalogoLabels";
import { CategoriaPersonalizacaoInfo } from "../../dto/enums/CategoriaPersonalizacaoEnum";
import type { CategoriaPersonalizacaoEnum } from "../../dto/enums/CategoriaPersonalizacaoEnum";
import { SfPillByCategory, SfPillList } from "../../components/common/SfCatalogoPills";

export function Configuracoes() {
  const navigate = useNavigate();
  const { perfil, limparAuth } = useAuth();
  useBuscarMeuPerfil();
  const { editar, loading: salvando, error: erroEditar } = useEditarPerfil();
  const { catalogo: catalogoPersonalizacoes } = useListarCatalogo();
  const { restricoes: catalogoRestricoes } = useBuscarRestricoesAlimentares();
  const [bio, setBio] = useState(perfil?.detalhes?.bio ?? "");
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [restricoesSelecionadas, setRestricoesSelecionadas] = useState<Set<string>>(new Set());
  const [personalizacoesSelecionadas, setPersonalizacoesSelecionadas] = useState<Set<string>>(new Set());
  const [sucesso, setSucesso] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const scrollParaTopo = useCallback(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    setBio(perfil?.detalhes?.bio ?? "");
    setFotoPerfil(null);
  }, [perfil?.id, perfil?.detalhes?.bio, perfil?.detalhes?.possuiMidia]);

  const restricoesPerfilKey =
    perfil?.restricoesAlimentares?.map((r) => r.codigo).sort().join(",") ?? "";

  const personalizacoesPerfilKey =
    perfil?.personalizacao?.map((p) => p.codigo).sort().join(",") ?? "";

  useEffect(() => {
    setRestricoesSelecionadas(
      restricoesPerfilKey ? new Set(restricoesPerfilKey.split(",")) : new Set()
    );
  }, [restricoesPerfilKey]);

  useEffect(() => {
    setPersonalizacoesSelecionadas(
      personalizacoesPerfilKey ? new Set(personalizacoesPerfilKey.split(",")) : new Set()
    );
  }, [personalizacoesPerfilKey]);

  useEffect(() => {
    if (!sucesso) return;
    const timer = window.setTimeout(() => setSucesso(false), 5000);
    return () => window.clearTimeout(timer);
  }, [sucesso]);

  useEffect(() => {
    if (erroEditar) scrollParaTopo();
  }, [erroEditar, scrollParaTopo]);

  const handleSalvar = async () => {
    setSucesso(false);
    await editar(
      {
        bio: bio || undefined,
        restricoesAlimentares: Array.from(restricoesSelecionadas),
        personalizacoes: Array.from(personalizacoesSelecionadas),
      },
      fotoPerfil,
      async (perfilAtualizado) => {
        setSucesso(true);
        scrollParaTopo();
        if (perfilAtualizado) {
          setBio(perfilAtualizado.detalhes?.bio ?? "");
          setFotoPerfil(null);
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
      if (next.has(codigo)) {
        next.delete(codigo);
      } else {
        next.add(codigo);
      }
      return next;
    });
  };

  const togglePersonalizacao = (codigo: string) => {
    setPersonalizacoesSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(codigo)) {
        next.delete(codigo);
      } else {
        next.add(codigo);
      }
      return next;
    });
  };

  const personalizacoesPorCategoria = useMemo(
    () =>
      Object.fromEntries(
        (catalogoPersonalizacoes ?? []).map((grupo) => [grupo.categoria, grupo.opcoes])
      ),
    [catalogoPersonalizacoes]
  );

  return (
    <main ref={mainRef} className="config-main">
        <div className="config-container">

          <header className="config-header">
            <p className="config-eyebrow">Conta</p>
            <h1 className="config-title">Configurações</h1>
            <p className="config-subtitle">
              Atualize seu perfil, preferências e restrições alimentares.
            </p>
          </header>

          {(sucesso || erroEditar) && (
            <div className="config-feedback" role="status" aria-live="polite">
              {sucesso && (
                <p className="config-success">Perfil atualizado com sucesso.</p>
              )}
              {erroEditar && (
                <p className="config-error-msg">{erroEditar}</p>
              )}
            </div>
          )}

          {/* ── Perfil ── */}
          <section className="config-section">
            <h2 className="config-section__title">Meu perfil</h2>

            <div className="config-profile-header">
              <PerfilAvatar
                perfilId={perfil?.id}
                possuiMidia={perfil?.detalhes?.possuiMidia}
                contexto={ContextoMidiaPerfil.CAPA_PERFIL}
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

            <div className="config-field">
              <ImagemUploadField
                label="Foto de perfil"
                arquivo={fotoPerfil}
                onArquivoChange={setFotoPerfil}
                disabled={salvando}
              />
            </div>

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
            <h2 className="config-section__title">Restrições alimentares</h2>
            <p className="config-section__desc">
              Marque suas restrições para que o app filtre receitas incompatíveis.
            </p>

            <SfPillList
              items={catalogoRestricoes ?? []}
              selecionadas={restricoesSelecionadas}
              onToggle={toggleRestriçao}
              getLabel={labelRestricaoPerfil}
              getTitle={(r) => r.exemplos}
              emptyMessage="Nenhuma restrição disponível."
            />

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
            <h2 className="config-section__title">Preferências</h2>
            <p className="config-section__desc">
              Personalize o seu perfil com tags que te representam.
            </p>

            {catalogoPersonalizacoes && catalogoPersonalizacoes.length > 0 ? (
              <SfPillByCategory
                grouped={personalizacoesPorCategoria}
                selecionadas={personalizacoesSelecionadas}
                onToggle={togglePersonalizacao}
                getLabel={(p) => labelPersonalizacao(p, "perfil")}
                getCategoryLabel={(cat) =>
                  CategoriaPersonalizacaoInfo[cat as CategoriaPersonalizacaoEnum]?.label ?? cat
                }
              />
            ) : (
              <span className="sf-pill-empty">Nenhuma tag disponível.</span>
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
  );
}

export default Configuracoes;
