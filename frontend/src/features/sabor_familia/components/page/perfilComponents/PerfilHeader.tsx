import "./perfilHeader.css";
import { useNavigate } from "react-router-dom";
import type { PerfilResponse } from "../../../dto/perfil/response/PerfilResponse";
import { ContextoMidiaPerfil } from "../../../dto/enums/ContextoMidiaEnum";
import { PerfilAvatar } from "../../common/PerfilAvatar";
import { BotaoSeguir } from "../../common/BotaoSeguir";
import "../../common/sfPillToggle.css";
import {
  labelPersonalizacao,
  labelRestricaoPerfil,
} from "../../../utils/catalogoLabels";
import { TEXTOS_INTERFACE } from "../../../utils/textosInterface";

interface Props {
  perfil: PerfilResponse;
  totalPosts: number;
  seguindo: boolean;
  countSeguidores: number;
  countSeguindo: number;
  onAlternarSeguir: () => void;
  loadingSeguir: boolean;
}

export function PerfilHeader({
  perfil,
  totalPosts,
  seguindo,
  countSeguidores,
  countSeguindo,
  onAlternarSeguir,
  loadingSeguir,
}: Props) {
  const navigate = useNavigate();

  return (
    <header className="ph-header">

      {/* ── Faixa de cover ── */}
      <div className="ph-cover">
        <div className="ph-cover__pattern" />
      </div>

      {/* ── Corpo ── */}
      <div className="ph-body">

        {/* Linha: avatar + botões */}
        <div className="ph-avatar-row">
          <div className="ph-avatar-wrap">
            <PerfilAvatar
              perfilId={perfil.id}
              possuiMidia={perfil.detalhes.possuiMidia}
              contexto={ContextoMidiaPerfil.CAPA_PERFIL}
              alt={perfil.detalhes.nome}
              className="ph-avatar"
              placeholderClassName="ph-avatar ph-avatar--placeholder"
            />
          </div>

          <div className="ph-actions">
            {!perfil.proprioPerfil && (
              <BotaoSeguir
                seguindo={seguindo}
                loading={loadingSeguir}
                onClick={onAlternarSeguir}
              />
            )}
            {perfil.proprioPerfil && (
              <button
                className="ph-btn-editar"
                onClick={() => navigate("/sabor-familia/configuracoes")}
              >
                {TEXTOS_INTERFACE.perfil.editarPerfil}
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="ph-info">

          {/* Nome */}
          <h1 className="ph-nome">{perfil.detalhes.nome}</h1>

          {/* Stats */}
          <div className="ph-stats">
            <div className="ph-stat">
              <span className="ph-stat__num">{totalPosts}</span>
              <span className="ph-stat__label">{TEXTOS_INTERFACE.perfil.statReceitas}</span>
            </div>

            <button
              className="ph-stat ph-stat--btn"
              onClick={() => navigate(`/sabor-familia/perfil/${perfil.id}/seguidores`)}
            >
              <span className="ph-stat__num">{countSeguidores}</span>
              <span className="ph-stat__label">{TEXTOS_INTERFACE.perfil.statSeguidores}</span>
            </button>

            <button
              className="ph-stat ph-stat--btn"
              onClick={() => navigate(`/sabor-familia/perfil/${perfil.id}/seguindo`)}
            >
              <span className="ph-stat__num">{countSeguindo}</span>
              <span className="ph-stat__label">{TEXTOS_INTERFACE.perfil.statSeguindo}</span>
            </button>
          </div>

          {(perfil.detalhes.bio?.trim() ||
            (perfil.personalizacao?.length ?? 0) > 0 ||
            (perfil.restricoesAlimentares?.length ?? 0) > 0) && (
            <div className="ph-details">
              {perfil.detalhes.bio?.trim() && (
                <section className="ph-details-block" aria-labelledby="ph-bio">
                  <h2 id="ph-bio" className="ph-details-block__title">
                    {TEXTOS_INTERFACE.perfil.secaoSobre}
                  </h2>
                  <p className="ph-details-block__hint">
                    {TEXTOS_INTERFACE.perfil.secaoSobreHint}
                  </p>
                  <p className="ph-bio">{perfil.detalhes.bio.trim()}</p>
                </section>
              )}

              {perfil.personalizacao?.length > 0 && (
                <section className="ph-details-block" aria-labelledby="ph-tags-personalizacao">
                  <h2 id="ph-tags-personalizacao" className="ph-details-block__title">
                    {TEXTOS_INTERFACE.perfil.secaoPreferencias}
                  </h2>
                  <p className="ph-details-block__hint">
                    {TEXTOS_INTERFACE.perfil.secaoPreferenciasHint}
                  </p>
                  <div className="sf-pill-group">
                    {perfil.personalizacao.map((p) => (
                      <span key={p.codigo} className="sf-pill sf-pill--exibir">
                        {labelPersonalizacao(p, "perfil")}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {perfil.restricoesAlimentares?.length > 0 && (
                <section className="ph-details-block" aria-labelledby="ph-tags-restricoes">
                  <h2 id="ph-tags-restricoes" className="ph-details-block__title">
                    {TEXTOS_INTERFACE.perfil.secaoRestricoes}
                  </h2>
                  <p className="ph-details-block__hint">
                    {TEXTOS_INTERFACE.perfil.secaoRestricoesHint}
                  </p>
                  <div className="sf-pill-group">
                    {perfil.restricoesAlimentares.map((r) => (
                      <span
                        key={r.codigo}
                        className="sf-pill sf-pill--exibir"
                        title={r.exemplos}
                      >
                        {labelRestricaoPerfil(r)}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
