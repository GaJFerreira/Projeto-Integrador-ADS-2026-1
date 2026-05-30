import "./chat.css";
import "../home/homeSaborFamilia.css";
import { useState } from "react";
import { useBuscarConversas } from "../../hooks/UseConversa";
import { useBuscarSeguindo } from "../../hooks/UsePerfil";
import type { ConversaResponse } from "../../dto/menssagem/response/ConversaResponse";
import type { PerfilResumoResponse } from "../../dto/perfil/response/PerfilResumoResponse";
import { useAuth } from "../../hooks/UseAuth";
import Sidebar from "../../components/page/homePageComponents/SideBar";
import { PerfilAvatar } from "../../components/common/PerfilAvatar";
import ChatIcon from "../../icon/menu/ChatIcon";
import { ConversaAtiva } from "../../components/page/conversaComponents/ConversaAtiva";
import { NovaConversa } from "../../components/page/conversaComponents/NovaConversa";
import { formatHora } from "../../utils/formatarTempo";

export function Chat() {
  const { perfilId } = useAuth();
  const { conversas, loading, recarregar } = useBuscarConversas();
  const { seguindo, loading: loadingSeguindo } = useBuscarSeguindo(perfilId ?? 0, 0, 100);

  const [selecionada, setSelecionada] = useState<ConversaResponse | null>(null);
  const [novoDestinatario, setNovoDestinatario] = useState<PerfilResumoResponse | null>(null);
  const [showNova, setShowNova] = useState(false);

  const lista = conversas?.content ?? [];
  const listaSeguindo = seguindo?.content ?? [];

  const handleConversaCriada = async (conversaId: number) => {
    const fresh = await recarregar();
    setNovoDestinatario(null);
    setShowNova(false);
    const criada = fresh?.content.find((c) => c.id === conversaId);
    if (criada) setSelecionada(criada);
  };

  return (
    <div className="home-layout">
      <Sidebar />

      <div className="chat-layout">
        {/* ── Lista de conversas ── */}
        <aside className="chat-list">
          <div className="chat-list__header">
            <h2 className="chat-list__title">Mensagens</h2>
            <button
              className={`chat-nova-btn ${showNova ? "chat-nova-btn--active" : ""}`}
              onClick={() => {
                setShowNova((v) => !v);
                setNovoDestinatario(null);
              }}
              title="Nova mensagem"
            >
              ✏ Nova
            </button>
          </div>

          <div className="chat-list__items">
            {loading ? (
              <div className="chat-loading" style={{ marginTop: "3rem" }}>
                <div className="chat-spinner" />
                <span>Carregando…</span>
              </div>
            ) : (
              <>
                {lista.length > 0 && (
                  <>
                    {showNova && <div className="chat-section-label">Conversas</div>}
                    {lista.map((c) => (
                      <button
                        key={c.id}
                        className={`chat-list__item ${selecionada?.id === c.id && !novoDestinatario ? "chat-list__item--active" : ""}`}
                        onClick={() => {
                          setSelecionada(c);
                          setNovoDestinatario(null);
                          setShowNova(false);
                        }}
                      >
                        <PerfilAvatar
                          perfilId={c.contato.perfilId}
                          possuiMidia={c.contato.possuiMidia}
                          alt={c.contato.nome}
                          className="chat-list__avatar"
                          placeholderClassName="chat-list__avatar chat-list__avatar--placeholder"
                        />
                        <div className="chat-list__info">
                          <span className="chat-list__name">{c.contato.nome}</span>
                          <span className="chat-list__preview">{c.ultimaMensagem}</span>
                        </div>
                        {c.dataUltimaMensagem && (
                          <span className="chat-list__time">
                            {formatHora(c.dataUltimaMensagem)}
                          </span>
                        )}
                      </button>
                    ))}
                  </>
                )}

                {showNova && (
                  <>
                    <div className="chat-section-label">Seguindo</div>
                    {loadingSeguindo ? (
                      <div className="chat-loading" style={{ marginTop: "1rem" }}>
                        <div className="chat-spinner" />
                      </div>
                    ) : listaSeguindo.length === 0 ? (
                      <div className="chat-list__empty" style={{ padding: "1.5rem 1.25rem" }}>
                        <p>Você não segue ninguém ainda.</p>
                      </div>
                    ) : (
                      listaSeguindo.map((p) => (
                        <button
                          key={p.perfilId}
                          className={`chat-nova-item ${novoDestinatario?.perfilId === p.perfilId ? "chat-nova-item--active" : ""}`}
                          onClick={() => {
                            setNovoDestinatario(p);
                            setSelecionada(null);
                          }}
                        >
                          <PerfilAvatar
                            perfilId={p.perfilId}
                            possuiMidia={p.possuiMidia}
                            alt={p.nome}
                            className="chat-nova-item__avatar"
                            placeholderClassName="chat-nova-item__avatar chat-nova-item__avatar--placeholder"
                          />
                          <span className="chat-nova-item__nome">{p.nome}</span>
                          <span className="chat-nova-item__hint">Iniciar →</span>
                        </button>
                      ))
                    )}
                  </>
                )}

                {!showNova && lista.length === 0 && (
                  <div className="chat-list__empty">
                    <p>Você ainda não tem conversas.</p>
                    <p>
                      Clique em <strong>✏ Nova</strong> para iniciar.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>

        {novoDestinatario ? (
          <NovaConversa
            destinatario={novoDestinatario}
            onConversaCriada={handleConversaCriada}
          />
        ) : selecionada && perfilId ? (
          <ConversaAtiva conversa={selecionada} perfilId={perfilId} />
        ) : (
          <div className="chat-placeholder">
            <ChatIcon />
            <span>Selecione uma conversa ou clique em ✏ Nova</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
