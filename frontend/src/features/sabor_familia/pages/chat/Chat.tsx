import "./chat.css";
import "../home/homeSaborFamilia.css";
import { useState } from "react";
import { useBuscarConversas } from "../../hooks/UseConversa";
import type { ConversaResponse } from "../../dto/menssagem/response/ConversaResponse";
import { useAuth } from "../../hooks/UseAuth";
import Sidebar from "../../components/page/homePageComponents/SideBar";
import { PerfilAvatar } from "../../components/common/PerfilAvatar";
import ChatIcon from "../../icon/menu/ChatIcon";
import { ConversaAtiva } from "../../components/page/conversaComponents/ConversaAtiva";
import { formatHora } from "../../utils/formatarTempo";

export function Chat() {
  const { perfilId } = useAuth();
  const { conversas, loading } = useBuscarConversas();
  const [selecionada, setSelecionada] = useState<ConversaResponse | null>(null);

  const lista = conversas?.content ?? [];

  return (
    <div className="home-layout">
      <Sidebar />

      <div className="chat-layout">
        {/* ── Lista de conversas ── */}
        <aside className="chat-list">
          <div className="chat-list__header">
            <h2 className="chat-list__title">Mensagens</h2>
          </div>

          <div className="chat-list__items">
            {loading ? (
              <div className="chat-loading" style={{ marginTop: "3rem" }}>
                <div className="chat-spinner" />
                <span>Carregando…</span>
              </div>
            ) : lista.length === 0 ? (
              <div className="chat-list__empty">
                <p>Você ainda não tem conversas.</p>
                <p>Siga um perfil e inicie uma troca!</p>
              </div>
            ) : (
              lista.map((c) => (
                <button
                  key={c.id}
                  className={`chat-list__item ${selecionada?.id === c.id ? "chat-list__item--active" : ""}`}
                  onClick={() => setSelecionada(c)}
                >
                  <PerfilAvatar
                    src={c.contato.fotoPerfilUrl}
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
              ))
            )}
          </div>
        </aside>

        {/* ── Área de mensagens ── */}
        {selecionada && perfilId ? (
          <ConversaAtiva conversa={selecionada} perfilId={perfilId} />
        ) : (
          <div className="chat-placeholder">
            <ChatIcon />
            <span>Selecione uma conversa para começar</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
