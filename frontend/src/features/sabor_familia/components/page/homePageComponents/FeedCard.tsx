import "./feedCard.css";
import { useNavigate } from "react-router-dom";
import { useAlternarCurtida } from "../../../hooks/UseCurtida";
import { useAlternarFavorito } from "../../../hooks/UseFavorito";
// import { useBuscarComentarios } from "../../hooks/UseComentario";
import { formatarTempo } from "../../../utils/formatarTempo";
import CommentIcon from "../../../icon/menu/CommentIcon";
import BookmarkIcon from "../../../icon/menu/BookmarkIcon";
import HeartFillIcon from "../../../icon/menu/HeartFillIcon";
import type { ReceitaResponse } from "../../../dto/receita/response/ReceitaResponse";

interface FeedCardProps {
  receita: ReceitaResponse;
  isSelected: boolean;
  onClick: () => void;
}

function FeedCard({ receita, isSelected, onClick }: FeedCardProps) {
  const { curtido, totalCurtidas, alternar: alternarCurtida } = useAlternarCurtida(
    receita.id,
    receita.curtidoPeloUsuario,
    receita.estatisticas.curtidas
  );

  const { favoritado, alternar: alternarFavorito } = useAlternarFavorito(
    receita.id,
    (receita as ReceitaResponse & { favoritadoPeloUsuario?: boolean }).favoritadoPeloUsuario ?? false
  );

  const totalComentarios = receita.estatisticas.comentarios;

  const navigate = useNavigate();
  const tempo = receita.dataCadastro ? formatarTempo(receita.dataCadastro) : "";

  const fotoCapaUrl =
    (receita as ReceitaResponse & { fotoCapaUrl?: string | null }).fotoCapaUrl ?? null;

  return (
    <article className={`feed-card ${isSelected ? "feed-card--selected" : ""}`}>
      <header className="feed-card__header">
        <div
          className="feed-card__author"
          onClick={() => navigate(`/perfil/${receita.autor.perfilId}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate(`/perfil/${receita.autor.perfilId}`)}
        >
          {receita.autor.fotoPerfilUrl ? (
            <img
              src={receita.autor.fotoPerfilUrl}
              className="feed-card__avatar"
              alt={receita.autor.nome}
            />
          ) : (
            <div className="feed-card__avatar feed-card__avatar--placeholder">
              {receita.autor.nome?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}

          <div>
            <span className="feed-card__username">{receita.autor.nome}</span>
            {tempo && <span className="feed-card__time"> · {tempo}</span>}
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
          onClick={onClick}
          title="Ver comentários"
        >
          <CommentIcon />
          {totalComentarios > 0 && <span>{totalComentarios}</span>}
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
