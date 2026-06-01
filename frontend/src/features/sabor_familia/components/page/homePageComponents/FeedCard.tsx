import "./feedCard.css";
import { useEffect, useState } from "react";
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
import { ContextoMidiaPerfil } from "../../../dto/enums/ContextoMidiaEnum";
import { PerfilAvatar } from "../../common/PerfilAvatar";
import { ReceitaMidiaImage } from "../../common/ReceitaMidiaImage";
import HeartFillIcon from "../../../icon/menu/HeartFillIcon";
import { TEXTOS_INTERFACE } from "../../../utils/textosInterface";
import { formatarTempo } from "../../../utils/formatarTempo";
import { ReceitaAcoesAutor } from "../../common/ReceitaAcoesAutor";
import type { ReceitaResponse } from "../../../dto/receita/response/ReceitaResponse";

interface FeedCardProps {
  receita: ReceitaResponse;
  isSelected: boolean;
  onClick: () => void;
  onRemover?: (receitaId: number) => void;
  removendo?: boolean;
}

function FeedCard({
  receita,
  isSelected,
  onClick,
  onRemover,
  removendo = false,
}: FeedCardProps) {
  const { perfilId } = useAuth();
  const isAutor = perfilId !== null && receita.autor.perfilId === perfilId;
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

  const [totalComentarios, setTotalComentarios] = useState(
    receita.estatisticas.comentarios
  );

  useEffect(() => {
    setTotalComentarios(receita.estatisticas.comentarios);
  }, [receita.id, receita.estatisticas.comentarios]);

  const { comentarios, loading: carregandoComentarios, recarregar } = useBuscarComentarios(
    receita.id,
    showComments
  );
  const { adicionar, loading: adicionandoComentario } = useAdicionarComentario(receita.id);
  const { remover, loadingId: removendoComentarioId } = useRemoverComentario(receita.id);

  const navigate = useNavigate();
  const tempo = formatarTempo(receita.dataCadastro);

  const handleAdicionarComentario = async () => {
    if (!textoComentario.trim()) return;
    await adicionar(textoComentario, () => {
      setTextoComentario("");
      setTotalComentarios((n) => n + 1);
      recarregar();
    });
  };

  const handleRemoverComentario = async (comentarioId: number) => {
    await remover(comentarioId, () => {
      setTotalComentarios((n) => Math.max(0, n - 1));
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
            perfilId={receita.autor.perfilId}
            possuiMidia={receita.autor.possuiMidia}
            contexto={ContextoMidiaPerfil.AVATAR}
            alt={receita.autor.nome}
            className="feed-card__avatar"
            placeholderClassName="feed-card__avatar feed-card__avatar--placeholder"
          />

          <div>
            <span className="feed-card__username">{receita.autor.nome}</span>
            {tempo ? <span className="feed-card__time"> · {tempo}</span> : null}
          </div>
        </div>

        {isAutor && onRemover && (
          <ReceitaAcoesAutor
            receitaId={receita.id}
            onRemover={() => onRemover(receita.id)}
            disabled={removendo}
            variant="inline"
          />
        )}
      </header>

      <ReceitaMidiaImage
        receitaId={receita.id}
        possuiMidia={receita.possuiMidia}
        alt={receita.detalhes.titulo}
        wrapClassName="feed-card__image-wrap"
        className="feed-card__image"
        emptyClassName="feed-card__image feed-card__image--empty"
        onClick={onClick}
      />

      {showComments && (
        <section className="feed-card__comments">
          <div className="feed-card__comments-list">
            {carregandoComentarios ? (
              <p className="feed-card__comments-empty">
                {TEXTOS_INTERFACE.carregamento.comentarios}
              </p>
            ) : comentarios.length === 0 ? (
              <p className="feed-card__comments-empty">{TEXTOS_INTERFACE.acoes.comentariosVazios}</p>
            ) : (
              comentarios.map((comentario) => (
                <div key={comentario.id} className="feed-card__comment-item">
                  <div className="feed-card__comment-row">
                    <PerfilAvatar
                      perfilId={comentario.perfilId}
                      possuiMidia={comentario.possuiMidia}
                      contexto={ContextoMidiaPerfil.AVATAR}
                      alt={comentario.nomePerfil}
                      className="feed-card__comment-avatar"
                      placeholderClassName="feed-card__comment-avatar feed-card__comment-avatar--placeholder"
                    />
                    <div className="feed-card__comment-body">
                  <div className="feed-card__comment-header">
                    <strong className="feed-card__comment-author">{comentario.nomePerfil}</strong>
                    {perfilId !== null && comentario.perfilId === perfilId && (
                      <button
                        className="feed-card__comment-remove"
                        onClick={() => handleRemoverComentario(comentario.id)}
                        disabled={removendoComentarioId === comentario.id}
                      >
                        {removendoComentarioId === comentario.id
                          ? TEXTOS_INTERFACE.acoes.apagando
                          : TEXTOS_INTERFACE.acoes.apagar}
                      </button>
                    )}
                  </div>
                  <span className="feed-card__comment-text">{comentario.comentario}</span>
                    </div>
                  </div>
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
              {adicionandoComentario ? "…" : TEXTOS_INTERFACE.acoes.enviar}
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
          title={TEXTOS_INTERFACE.acoes.comentarios}
        >
          <CommentIcon />
          <span>
            {showComments ? TEXTOS_INTERFACE.acoes.fechar : TEXTOS_INTERFACE.acoes.comentarios}
          </span>
          {!showComments && totalComentarios > 0 && <span>({totalComentarios})</span>}
        </button>

        {/* Favoritar */}
        <button
          type="button"
          className={`feed-card__action feed-card__action--favorito ${favoritado ? "feed-card__action--favoritado" : ""}`}
          onClick={(e) => { e.stopPropagation(); alternarFavorito(); }}
          aria-pressed={favoritado}
          aria-label={
            favoritado
              ? TEXTOS_INTERFACE.receita.descricaoRemoverFavoritos
              : TEXTOS_INTERFACE.receita.descricaoSalvarFavoritos
          }
          title={
            favoritado
              ? TEXTOS_INTERFACE.receita.descricaoRemoverFavoritos
              : TEXTOS_INTERFACE.receita.descricaoSalvarFavoritos
          }
        >
          <BookmarkIcon active={favoritado} />
          <span className="feed-card__action-label feed-card__action-label--desktop">
            {favoritado
              ? TEXTOS_INTERFACE.receita.salvaFavoritos
              : TEXTOS_INTERFACE.receita.salvarFavoritos}
          </span>
          <span className="feed-card__action-label feed-card__action-label--mobile">
            {favoritado
              ? TEXTOS_INTERFACE.receita.salvaFavoritosMobile
              : TEXTOS_INTERFACE.receita.salvarFavoritosMobile}
          </span>
        </button>
      </footer>
    </article>
  );
}

export default FeedCard;
