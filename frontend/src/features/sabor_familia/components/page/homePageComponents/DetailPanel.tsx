import "./detailPanel.css";
import { useState } from "react";
import { useBuscarComentarios, useAdicionarComentario } from "../../../hooks/UseComentario";
import type { ReceitaResponse } from "../../../dto/receita/response/ReceitaResponse";
import type { RestricaoAlimentarResumoResponse } from "../../../dto/restricao/response/RestricaoAlimentarResumoResponse";
import type { PersonalizacaoResumoResponse } from "../../../dto/personalizacao/response/PersonalizacaoResumoResponse";

interface DetailPanelProps {
  receita: ReceitaResponse;
  onClose: () => void;
}

function DetailPanel({ receita, onClose }: DetailPanelProps) {
  const { comentarios, recarregar } = useBuscarComentarios(receita.id);
  const { adicionar, loading: adicionando } = useAdicionarComentario(receita.id);
  const [texto, setTexto] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleComment = async () => {
    if (!texto.trim()) return;
    await adicionar(texto, () => {
      setTexto("");
      recarregar();
    });
  };

  const ingredientesList = receita.detalhes.ingredientes
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <aside className="detail-panel">
      <button className="detail-panel__close" onClick={onClose} title="Fechar">
        ✕
      </button>

      <div className="detail-panel__scroll">
        {/* ── Título ── */}
        <h2 className="detail-panel__title">{receita.detalhes.titulo}</h2>

        {/* ── Tipo de refeição ── */}
        {receita.detalhes.tipoRefeicao && (
          <div className="detail-section">
            <span className="detail-badge detail-badge--type">
              {receita.detalhes.tipoRefeicao}
            </span>
          </div>
        )}

        {/* ── Ingredientes ── */}
        {ingredientesList.length > 0 && (
          <section className="detail-section">
            <h3 className="detail-section__label">Ingredientes</h3>
            <ul className="detail-ingredients">
              {ingredientesList.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Modo de preparo ── */}
        {receita.detalhes.modoPreparo && (
          <section className="detail-section">
            <h3 className="detail-section__label">Modo de Preparo</h3>
            <p className="detail-text">{receita.detalhes.modoPreparo}</p>
          </section>
        )}

        {/* ── História da receita ── */}
        {receita.detalhes.historia && (
          <section className="detail-section">
            <h3 className="detail-section__label">História da Receita</h3>
            <p className="detail-text detail-text--story">{receita.detalhes.historia}</p>
          </section>
        )}

        {/* ── Tempo de preparo ── */}
        {receita.detalhes.tempoPreparoMin != null && (
          <section className="detail-section">
            <h3 className="detail-section__label">Tempo de Preparo</h3>
            <p className="detail-text">{receita.detalhes.tempoPreparoMin} Minutos</p>
          </section>
        )}

        {/* ── Porções ── */}
        {receita.detalhes.qtdPorcoes != null && (
          <section className="detail-section">
            <h3 className="detail-section__label">Porções</h3>
            <p className="detail-text">{receita.detalhes.qtdPorcoes} porções</p>
          </section>
        )}

        {/* ── Restrições alimentares ── */}
        {receita.restricoesAlimentares.length > 0 && (
          <section className="detail-section">
            <h3 className="detail-section__label">Restrições</h3>
            <div className="detail-tags">
              {receita.restricoesAlimentares.map((r: RestricaoAlimentarResumoResponse) => (
                <span key={r.codigo} className="detail-tag detail-tag--restricao">
                  {r.codigo}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── Personalizações / Tags ── */}
        {receita.personalizacao.length > 0 && (
          <section className="detail-section">
            <h3 className="detail-section__label">Tags</h3>
            <div className="detail-tags">
              {receita.personalizacao.map((p: PersonalizacaoResumoResponse) => (
                <span key={p.codigo} className="detail-tag detail-tag--tag">
                  #{p.codigo.replace(/^#/, "")}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── Comentários ── */}
        <section className="detail-section">
          <button
            className="detail-section__label detail-toggle"
            onClick={() => setShowComments((v) => !v)}
          >
            Comentários ({receita.estatisticas.comentarios}) {showComments ? "▲" : "▼"}
          </button>

          {showComments && (
            <>
              <div className="detail-comments">
                {comentarios.length === 0 ? (
                  <p className="detail-comments__empty">Nenhum comentário ainda.</p>
                ) : (
                  comentarios.map((c) => (
                    <div key={c.id} className="detail-comment">
                      <strong className="detail-comment__author">{c.nomePerfil}</strong>
                      <span className="detail-comment__text">{c.comentario}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="detail-comment-form">
                <input
                  className="detail-comment-input"
                  placeholder="Adicionar comentário..."
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                />
                <button
                  className="detail-comment-btn"
                  onClick={handleComment}
                  disabled={adicionando || !texto.trim()}
                >
                  {adicionando ? "…" : "Enviar"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </aside>
  );
}

export default DetailPanel;
