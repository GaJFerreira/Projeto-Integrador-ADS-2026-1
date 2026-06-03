import "./conversaAtiva.css";
import SendIcon from "../../../icon/messagem/SendIcon";
import TrashIcon from "../../../icon/menu/TrashIcon";
import { formatDataHora } from "../../../utils/formatarTempo";
import {
  TEXTOS_INTERFACE,
  opcoesDialogoApagarMensagem,
} from "../../../utils/textosInterface";
import {
  useMensagensConversa,
  useEnviarMensagem,
  useRemoverMensagem,
} from "../../../hooks/UseConversa";
import { useDialogoConfirmacao } from "../../../context/DialogoConfirmacao";
import { useState, useEffect, useRef, type RefObject } from "react";
import type { ConversaResponse } from "../../../dto/menssagem/response/ConversaResponse";
import type { EventoMensagemWs } from "../../../dto/menssagem/response/EventoMensagemWs";
import type { EnviarMensagemResponse } from "../../../dto/menssagem/response/EnviarMensagemResponse";
import { ContextoMidiaPerfil } from "../../../dto/enums/ContextoMidiaEnum";
import { PerfilAvatar } from "../../common/PerfilAvatar";

export function ConversaAtiva({
  conversa,
  perfilId,
  onVoltar,
  onNovaMensagemRef,
  onMensagemEnviada,
  onMensagemApagada,
}: {
  conversa: ConversaResponse;
  perfilId: number;
  onVoltar?: () => void;
  onNovaMensagemRef?: RefObject<((event: EventoMensagemWs) => void) | null>;
  onMensagemEnviada?: (response: EnviarMensagemResponse) => void;
  onMensagemApagada?: (event: EventoMensagemWs) => void;
}) {
  const {
    mensagens,
    hasMore,
    loadingInicial,
    loadingMais,
    carregarMais,
    adicionarMensagem,
    aplicarMensagemApagada,
  } = useMensagensConversa(conversa.id);
  const { enviar, loading: enviando } = useEnviarMensagem();
  const { remover, loadingId: removendoMensagemId } = useRemoverMensagem();
  const pedirConfirmacao = useDialogoConfirmacao();
  const [texto, setTexto] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const mensagensPreviasRef = useRef(0);

  useEffect(() => {
    if (!onNovaMensagemRef) return;

    const handler = (event: EventoMensagemWs) => {
      if (event.conversaId !== conversa.id) return;
      if (event.tipo === "NOVA") {
        adicionarMensagem(event.mensagem);
        return;
      }
      aplicarMensagemApagada(event.mensagem);
    };

    onNovaMensagemRef.current = handler;
    return () => {
      if (onNovaMensagemRef.current === handler) {
        onNovaMensagemRef.current = null;
      }
    };
  }, [conversa.id, adicionarMensagem, aplicarMensagemApagada, onNovaMensagemRef]);

  useEffect(() => {
    mensagensPreviasRef.current = 0;
  }, [conversa.id]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || loadingInicial) return;

    const totalAtual = mensagens.length;
    const totalAnterior = mensagensPreviasRef.current;

    if (totalAnterior === 0 && totalAtual > 0) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
      mensagensPreviasRef.current = totalAtual;
      return;
    }

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
        onMensagemEnviada?.(response);
      }
    );
  };

  const handleApagarMensagem = async (mensagemId: number) => {
    const confirmou = await pedirConfirmacao(opcoesDialogoApagarMensagem());
    if (!confirmou) return;

    await remover(mensagemId, (response) => {
      aplicarMensagemApagada(response.mensagem);
      onMensagemApagada?.({
        tipo: "APAGADA",
        conversaId: response.conversaId,
        mensagem: response.mensagem,
        ultimaMensagem: response.ultimaMensagem,
        dataUltimaMensagem: response.dataUltimaMensagem,
        naoLidas: response.naoLidas,
      });
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  return (
    <div className="chat-messages-area">
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

      <div ref={scrollRef} className="chat-messages-scroll">
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
            const textoExibido = msg.apagada
              ? TEXTOS_INTERFACE.mensagens.textoApagada
              : msg.texto;
            return (
              <div
                key={msg.id}
                className={`chat-bubble-wrap ${mine ? "chat-bubble-wrap--mine" : "chat-bubble-wrap--other"}`}
              >
                {!mine && (
                  <span className="chat-bubble__sender">{msg.perfilRemetente.nome}</span>
                )}
                <div className="chat-bubble-row">
                  {mine && !msg.apagada && (
                    <button
                      type="button"
                      className="chat-bubble__delete-btn"
                      onClick={() => handleApagarMensagem(msg.id)}
                      disabled={removendoMensagemId === msg.id}
                      aria-label={TEXTOS_INTERFACE.mensagens.apagarMensagem}
                      title={TEXTOS_INTERFACE.mensagens.apagarMensagem}
                    >
                      {removendoMensagemId === msg.id ? (
                        <span className="chat-bubble__delete-spinner" />
                      ) : (
                        <TrashIcon />
                      )}
                    </button>
                  )}
                  <div
                    className={`chat-bubble ${mine ? "chat-bubble--mine" : "chat-bubble--other"} ${
                      msg.apagada ? "chat-bubble--deleted" : ""
                    }`}
                  >
                    {textoExibido}
                  </div>
                </div>
                {!msg.apagada && (
                  <span className="chat-bubble__time">
                    {formatDataHora(msg.dataEnvio)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

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
