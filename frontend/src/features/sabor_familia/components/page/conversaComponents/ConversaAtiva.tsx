import "./conversaAtiva.css";
import SendIcon from "../../../icon/messagem/SendIcon";
import { formatDataHora } from "../../../utils/formatarTempo";
import { TEXTOS_INTERFACE } from "../../../utils/textosInterface";
import {
  useMensagensConversa,
  useEnviarMensagem,
} from "../../../hooks/UseConversa";
import { useState, useEffect, useRef, type RefObject } from "react";
import type { ConversaResponse } from "../../../dto/menssagem/response/ConversaResponse";
import type { NovaMensagemEvent } from "../../../dto/menssagem/response/NovaMensagemEvent";
import { ContextoMidiaPerfil } from "../../../dto/enums/ContextoMidiaEnum";
import { PerfilAvatar } from "../../common/PerfilAvatar";

export function ConversaAtiva({
  conversa,
  perfilId,
  onVoltar,
  onNovaMensagemRef,
  onMensagemEnviada,
}: {
  conversa: ConversaResponse;
  perfilId: number;
  onVoltar?: () => void;
  onNovaMensagemRef?: RefObject<((event: NovaMensagemEvent) => void) | null>;
  onMensagemEnviada?: (event: NovaMensagemEvent) => void;
}) {
  const { mensagens, hasMore, loadingInicial, loadingMais, carregarMais, adicionarMensagem } =
    useMensagensConversa(conversa.id);
  const { enviar, loading: enviando } = useEnviarMensagem();
  const [texto, setTexto] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const mensagensPreviasRef = useRef(0);

  useEffect(() => {
    if (!onNovaMensagemRef) return;

    const handler = (event: NovaMensagemEvent) => {
      if (event.conversaId !== conversa.id) return;
      adicionarMensagem(event.mensagem);
    };

    onNovaMensagemRef.current = handler;
    return () => {
      if (onNovaMensagemRef.current === handler) {
        onNovaMensagemRef.current = null;
      }
    };
  }, [conversa.id, adicionarMensagem, onNovaMensagemRef]);

  useEffect(() => {
    mensagensPreviasRef.current = 0;
  }, [conversa.id]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || loadingInicial) return;

    const totalAtual = mensagens.length;
    const totalAnterior = mensagensPreviasRef.current;

    // Ao abrir a conversa, começar no fim (mensagens mais recentes).
    if (totalAnterior === 0 && totalAtual > 0) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
      mensagensPreviasRef.current = totalAtual;
      return;
    }

    // Em novas mensagens, manter foco no fim se o usuário já estava perto do final.
    if (!loadingMais && totalAtual > totalAnterior) {
      const distanciaDoFim =
        scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
      if (distanciaDoFim < 120) {
        scrollEl.scrollTop = scrollEl.scrollHeight;
      }
    }

    mensagensPreviasRef.current = totalAtual;
  }, [mensagens, loadingInicial, loadingMais]);

  const handleEnviar = async () => {
    const msg = texto.trim();
    if (!msg || enviando) return;
    setTexto("");
    await enviar(
      { destinatarioId: conversa.contato.usuarioId, mensagem: msg },
      (response) => {
        adicionarMensagem(response.mensagem);
        onMensagemEnviada?.({
          conversaId: response.conversaId,
          mensagem: response.mensagem,
        });
      }
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
        {onVoltar && (
          <button
            type="button"
            className="chat-messages-header__voltar"
            onClick={onVoltar}
          >
            ← Voltar
          </button>
        )}
        <PerfilAvatar
          perfilId={conversa.contato.perfilId}
          possuiMidia={conversa.contato.possuiMidia}
          contexto={ContextoMidiaPerfil.CAPA_PERFIL}
          alt={conversa.contato.nome}
          className="chat-messages-header__avatar"
          placeholderClassName="chat-messages-header__avatar chat-messages-header__avatar--placeholder"
        />
        <span className="chat-messages-header__name">{conversa.contato.nome}</span>
      </div>

      {/* ── Mensagens ── */}
      <div ref={scrollRef} className="chat-messages-scroll">
        {/* Carregar mensagens anteriores */}
        {hasMore && !loadingMais && (
          <button className="chat-load-more" onClick={carregarMais}>
            {TEXTOS_INTERFACE.mensagens.carregarAnteriores}
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
            <span>{TEXTOS_INTERFACE.mensagens.carregandoMensagens}</span>
          </div>
        ) : mensagens.length === 0 ? (
          <p className="chat-empty-lead">{TEXTOS_INTERFACE.mensagens.semMensagens}</p>
        ) : (
          mensagens.map((msg) => {
            const mine = msg.perfilRemetente.perfilId === perfilId;
            const nomeRemetente = mine ? "Você" : msg.perfilRemetente.nome;
            return (
              <div
                key={msg.id}
                className={`chat-bubble-wrap ${mine ? "chat-bubble-wrap--mine" : "chat-bubble-wrap--other"}`}
              >
                <span className={`chat-bubble__sender ${mine ? "chat-bubble__sender--mine" : ""}`}>
                  {nomeRemetente}
                </span>
                <div className={`chat-bubble ${mine ? "chat-bubble--mine" : "chat-bubble--other"}`}>
                  {msg.texto}
                </div>
                <span className="chat-bubble__time">
                  {formatDataHora(msg.dataEnvio)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* ── Input de envio ── */}
      <div className="chat-input-area">
        <textarea
          className="chat-input"
          rows={1}
          placeholder={TEXTOS_INTERFACE.mensagens.digiteMensagem}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="chat-send-btn"
          onClick={handleEnviar}
          disabled={!texto.trim() || enviando}
          title={TEXTOS_INTERFACE.acoes.enviar}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
