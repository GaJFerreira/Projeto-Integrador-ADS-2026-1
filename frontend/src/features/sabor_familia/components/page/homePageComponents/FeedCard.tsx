import "./feedCard.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlternarCurtida } from "../../../hooks/UseCurtida";
import { useAlternarFavorito } from "../../../hooks/UseFavorito";
import {
  useAdicionarComentario,
  useBuscarComentarios,
  useRemoverComentario,
} from "../../../hooks/UseComentario";
import { useAuth } from "../../../hooks/UseAuth";
import CommentIcon from "../../../icon/menu/CommentIcon";
import BookmarkIcon from "../../../icon/menu/BookmarkIcon";
import { PerfilAvatar } from "../../common/PerfilAvatar";
import HeartFillIcon from "../../../icon/menu/HeartFillIcon";
import { formatarTempo } from "../../../utils/formatarTempo";
import type { ReceitaResponse } from "../../../dto/receita/response/ReceitaResponse";

interface FeedCardProps {
  receita: ReceitaResponse;
  isSelected: boolean;
  onClick: () => void;
}

function FeedCard({ receita, isSelected, onClick }: FeedCardProps) {
  const { perfilId } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [textoComentario, setTextoComentario] = useState("");
  const { curtido, totalCurtidas, alternar: alternarCurtida } = useAlternarCurtida(
    receita.id,
    receita.curtidoPeloUsuario,
    receita.estatisticas.curtidas
  );

  const { favoritado, alternar: alternarFavorito } = useAlternarFavorito(
    receita.id,
    receita.favoritadoPeloUsuario ?? false
  );

  const totalComentarios = receita.estatisticas.comentarios;
  const { comentarios, loading: carregandoComentarios, recarregar } = useBuscarComentarios(
    receita.id,
    showComments
  );
  const { adicionar, loading: adicionandoComentario } = useAdicionarComentario(receita.id);
  const { remover, loadingId: removendoComentarioId } = useRemoverComentario(receita.id);

  const navigate = useNavigate();
  const tempo = formatarTempo(receita.dataCadastro);

  const fotoCapaUrl =
    (receita as ReceitaResponse & { fotoCapaUrl?: string | null }).fotoCapaUrl ?? null;

  const handleAdicionarComentario = async () => {
    if (!textoComentario.trim()) return;
    await adicionar(textoComentario, () => {
      setTextoComentario("");
      recarregar();
    });
  };

  const handleRemoverComentario = async (comentarioId: number) => {
    await remover(comentarioId, () => {
      recarregar();
    });
  };

  return (
    <article className={`feed-card ${isSelected ? "feed-card--selected" : ""}`}>
      <header className="feed-card__header">
        <div
          className="feed-card__author"
          onClick={() => navigate(`/sabor-familia/perfil/${receita.autor.perfilId}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate(`/sabor-familia/perfil/${receita.autor.perfilId}`)}
        >
          <PerfilAvatar
            src={receita.autor.fotoPerfilUrl}
            alt={receita.autor.nome}
            className="feed-card__avatar"
            placeholderClassName="feed-card__avatar feed-card__avatar--placeholder"
          />

          <div>
            <span className="feed-card__username">{receita.autor.nome}</span>
            {tempo ? <span className="feed-card__time"> · {tempo}</span> : null}
          </div>
        </div>
      </header>

      {/* ── Imagem da receita ── */}
      <div className="feed-card__image-wrap" onClick={onClick}>
        {fotoCapaUrl ? (
          <img
            src={fotoCapaUrl}
            alt={receita.detalhes.titulo}
            className="feed-card__image"
          />
        ) : (
          <div className="feed-card__image feed-card__image--empty">
            <span>Sem imagem</span>
          </div>
        )}
      </div>

      {showComments && (
        <section className="feed-card__comments">
          <div className="feed-card__comments-list">
            {carregandoComentarios ? (
              <p className="feed-card__comments-empty">Carregando comentários...</p>
            ) : comentarios.length === 0 ? (
              <p className="feed-card__comments-empty">Nenhum comentário ainda.</p> 
            ) : (
              comentarios.map((comentario) => (
                <div key={comentario.id} className="feed-card__comment-item">
                  <div className="feed-card__comment-header">
                    <strong className="feed-card__comment-author">{comentario.nomePerfil}</strong>
                    {perfilId !== null && comentario.perfilId === perfilId && (
                      <button
                        className="feed-card__comment-remove"
                        onClick={() => handleRemoverComentario(comentario.id)}
                        disabled={removendoComentarioId === comentario.id}
                      >
                        {removendoComentarioId === comentario.id ? "Removendo..." : "Apagar"}
                      </button>
                    )}
                  </div>
                  <span className="feed-card__comment-text">{comentario.comentario}</span>
                </div>
              ))
            )}
          </div>

          <div className="feed-card__comment-form">
            <input
              className="feed-card__comment-input"
              placeholder="Escreva um comentário..."
              value={textoComentario}
              onChange={(e) => setTextoComentario(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdicionarComentario()}
            />
            <button
              className="feed-card__comment-btn"
              onClick={handleAdicionarComentario}
              disabled={adicionandoComentario || !textoComentario.trim()}
            >
              {adicionandoComentario ? "..." : "Enviar"}
            </button>
          </div>
        </section>
      )}

      <footer className="feed-card__footer">
        {/* Curtir */}
        <button
          className={`feed-card__action ${curtido ? "feed-card__action--liked" : ""}`}
          onClick={(e) => { e.stopPropagation(); alternarCurtida(); }}
          title="Curtir"
        >
          <HeartFillIcon active={curtido} />
          <span>{totalCurtidas.toLocaleString("pt-BR")} curtidas</span>
        </button>

        {/* Comentários */}
        <button
          className="feed-card__action"
          onClick={(e) => {
            e.stopPropagation();
            setShowComments((valorAtual) => !valorAtual);
          }}
          title="Comentários"
        >
          <CommentIcon />
          <span>{showComments ? "Fechar" : "Comentários"}</span>
          {!showComments && totalComentarios > 0 && <span>({totalComentarios})</span>}
        </button>

        {/* Favoritar */}
        <button
          className={`feed-card__action feed-card__action--bookmark ${favoritado ? "feed-card__action--bookmarked" : ""}`}
          onClick={(e) => { e.stopPropagation(); alternarFavorito(); }}
          title="Salvar nos favoritos"
        >
          <BookmarkIcon active={favoritado} />
        </button>
      </footer>
    </article>
  );
}

export default FeedCard;
