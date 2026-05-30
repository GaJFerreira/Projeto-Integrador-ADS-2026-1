import "./conversaAtiva.css";
import SendIcon from "../../../icon/messagem/SendIcon";
// import { formatData, formatHora } from "../../../utils/formatarTempo";
import {
  useMensagensConversa,
  useEnviarMensagem,
} from "../../../hooks/UseConversa";
import { useState, useEffect, useRef } from "react";
import type { ConversaResponse } from "../../../dto/menssagem/response/ConversaResponse";
import { PerfilAvatar } from "../../common/PerfilAvatar";

export function ConversaAtiva({
  conversa,
  perfilId,
}: {
  conversa: ConversaResponse;
  perfilId: number;
}) {
  const { mensagens, hasMore, loadingInicial, loadingMais, carregarMais, recarregar } =
    useMensagensConversa(conversa.id);
  const { enviar, loading: enviando } = useEnviarMensagem();
  const [texto, setTexto] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const handleEnviar = async () => {
    const msg = texto.trim();
    if (!msg || enviando) return;
    setTexto("");
    await enviar(
      { destinatarioId: conversa.contato.usuarioId, mensagem: msg },
      () => recarregar()
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  return (
    <div className="chat-messages-area">
      {/* ── Cabeçalho ── */}
      <div className="chat-messages-header">
        <PerfilAvatar
          perfilId={conversa.contato.perfilId}
          possuiMidia={conversa.contato.possuiMidia}
          alt={conversa.contato.nome}
          className="chat-messages-header__avatar"
          placeholderClassName="chat-messages-header__avatar chat-messages-header__avatar--placeholder"
        />
        <span className="chat-messages-header__name">{conversa.contato.nome}</span>
      </div>

      {/* ── Mensagens ── */}
      <div className="chat-messages-scroll">
        {/* Carregar mensagens anteriores */}
        {hasMore && !loadingMais && (
          <button className="chat-load-more" onClick={carregarMais}>
            Carregar mensagens anteriores
          </button>
        )}
        {loadingMais && (
          <div className="chat-loading" style={{ flexDirection: "row", margin: "0.5rem auto" }}>
            <div className="chat-spinner" />
          </div>
        )}

        {loadingInicial ? (
          <div className="chat-loading">
            <div className="chat-spinner" />
            <span>Carregando mensagens…</span>
          </div>
        ) : mensagens.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, margin: "auto" }}>
            Nenhuma mensagem ainda. Diga olá! 👋
          </p>
        ) : (
          mensagens.map((msg) => {
            const mine = msg.perfilRemetente.perfilId === perfilId;
            return (
              <div
                key={msg.id}
                className={`chat-bubble-wrap ${mine ? "chat-bubble-wrap--mine" : "chat-bubble-wrap--other"}`}
              >
                <div className={`chat-bubble ${mine ? "chat-bubble--mine" : "chat-bubble--other"}`}>
                  {msg.texto}
                </div>
                <span className="chat-bubble__time">
                  {msg.dataEnvio}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input de envio ── */}
      <div className="chat-input-area">
        <textarea
          className="chat-input"
          rows={1}
          placeholder="Digite uma mensagem…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="chat-send-btn"
          onClick={handleEnviar}
          disabled={!texto.trim() || enviando}
          title="Enviar"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
