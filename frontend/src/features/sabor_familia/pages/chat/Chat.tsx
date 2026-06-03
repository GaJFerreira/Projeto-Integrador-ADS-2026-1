import "./chat.css";
import "../home/homeSaborFamilia.css";
import "../../components/common/sfPillToggle.css";
import { useCallback, useRef, useState } from "react";
import { useBuscarConversas } from "../../hooks/UseConversa";
import { useBuscarSeguindo } from "../../hooks/UsePerfil";
import { useChatSocketSubscription } from "../../context/ChatSocketContext";
import type { EventoMensagemWs } from "../../dto/menssagem/response/EventoMensagemWs";
import type { EnviarMensagemResponse } from "../../dto/menssagem/response/EnviarMensagemResponse";
import type { ConversaResponse } from "../../dto/menssagem/response/ConversaResponse";
import type { PerfilResumoResponse } from "../../dto/perfil/response/PerfilResumoResponse";
import { useAuth } from "../../hooks/UseAuth";
import { ContextoMidiaPerfil } from "../../dto/enums/ContextoMidiaEnum";
import { PerfilAvatar } from "../../components/common/PerfilAvatar";
import ChatIcon from "../../icon/menu/ChatIcon";
import { ConversaAtiva } from "../../components/page/conversaComponents/ConversaAtiva";
import { NovaConversa } from "../../components/page/conversaComponents/NovaConversa";
import { formatHora } from "../../utils/formatarTempo";
import { TEXTOS_INTERFACE } from "../../utils/textosInterface";

export function Chat() {
  const { perfilId, usuarioId } = useAuth();
  const { conversas, loading, recarregar, aplicarEventoConversa, marcarConversaComoLidaLocal } =
    useBuscarConversas(usuarioId);
  const { seguindo, loading: loadingSeguindo } = useBuscarSeguindo(perfilId ?? 0, 0, 100);

  const [selecionada, setSelecionada] = useState<ConversaResponse | null>(null);
  const [novoDestinatario, setNovoDestinatario] = useState<PerfilResumoResponse | null>(null);
  const [showNova, setShowNova] = useState(false);
  const conversaAtivaHandlerRef = useRef<((event: EventoMensagemWs) => void) | null>(null);

  const handleEventoMensagem = useCallback(
    (event: EventoMensagemWs) => {
      aplicarEventoConversa(event, selecionada?.id);
      conversaAtivaHandlerRef.current?.(event);
    },
    [aplicarEventoConversa, selecionada?.id]
  );

  const handleMensagemEnviada = useCallback(
    (response: EnviarMensagemResponse) => {
      aplicarEventoConversa(
        {
          tipo: "NOVA",
          conversaId: response.conversaId,
          mensagem: response.mensagem,
          ultimaMensagem: response.mensagem.texto,
          dataUltimaMensagem: response.mensagem.dataEnvio,
        },
        selecionada?.id
      );
    },
    [aplicarEventoConversa, selecionada?.id]
  );

  const handleMensagemApagada = useCallback(
    (event: EventoMensagemWs) => {
      aplicarEventoConversa(event, selecionada?.id);
    },
    [aplicarEventoConversa, selecionada?.id]
  );

  useChatSocketSubscription(handleEventoMensagem, !!perfilId);

  const lista = conversas?.content ?? [];
  const listaSeguindo = seguindo?.content ?? [];
  const painelConversaAberto = Boolean(selecionada || novoDestinatario);

  const handleConversaCriada = async (conversaId: number) => {
    const fresh = await recarregar();
    setNovoDestinatario(null);
    setShowNova(false);
    const criada = fresh?.content.find((c) => c.id === conversaId);
    if (criada) setSelecionada(criada);
  };

  return (
    <div className={`chat-layout ${painelConversaAberto ? "chat-layout--painel-aberto" : ""}`.trim()}>
        {/* ── Lista de conversas ── */}
        <aside className="chat-list">
          <div className="chat-list__header">
            <div className="chat-list__intro">
              <h2 className="chat-list__title">{TEXTOS_INTERFACE.mensagens.titulo}</h2>
              <p className="chat-list__subtitle">{TEXTOS_INTERFACE.mensagens.subtitulo}</p>
            </div>
            <button
              type="button"
              className={`sf-pill sf-pill--compacto ${showNova ? "sf-pill--selected" : ""}`}
              onClick={() => {
                setShowNova((v) => !v);
                setNovoDestinatario(null);
              }}
              title={TEXTOS_INTERFACE.mensagens.iniciarConversa}
              aria-pressed={showNova}
            >
              {TEXTOS_INTERFACE.mensagens.iniciarConversa}
            </button>
          </div>

          <div className="chat-list__items">
            {loading ? (
              <div className="chat-loading" style={{ marginTop: "3rem" }}>
                <div className="chat-spinner" />
                <span>{TEXTOS_INTERFACE.comum.carregando}</span>
              </div>
            ) : (
              <>
                {lista.length > 0 && (
                  <>
                    {showNova && <div className="chat-section-label">{TEXTOS_INTERFACE.mensagens.secaoConversas}</div>}
                    {lista.map((c) => (
                      <button
                        key={c.id}
                        className={`chat-list__item ${selecionada?.id === c.id && !novoDestinatario ? "chat-list__item--active" : ""}`}
                        onClick={() => {
                          marcarConversaComoLidaLocal(c.id);
                          setSelecionada(c);
                          setNovoDestinatario(null);
                          setShowNova(false);
                        }}
                      >
                        <PerfilAvatar
                          perfilId={c.contato.perfilId}
                          possuiMidia={c.contato.possuiMidia}
                          contexto={ContextoMidiaPerfil.CAPA_PERFIL}
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
                        {c.naoLidas > 0 && (
                          <span className="chat-list__badge">{c.naoLidas}</span>
                        )}
                      </button>
                    ))}
                  </>
                )}

                {showNova && (
                  <>
                    <div className="chat-section-label">{TEXTOS_INTERFACE.mensagens.secaoSeguindo}</div>
                    {loadingSeguindo ? (
                      <div className="chat-loading" style={{ marginTop: "1rem" }}>
                        <div className="chat-spinner" />
                      </div>
                    ) : listaSeguindo.length === 0 ? (
                      <div className="chat-list__empty" style={{ padding: "1.5rem 1.25rem" }}>
                        <p>{TEXTOS_INTERFACE.mensagens.semSeguindo}</p>
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
                            contexto={ContextoMidiaPerfil.AVATAR}
                            alt={p.nome}
                            className="chat-nova-item__avatar"
                            placeholderClassName="chat-nova-item__avatar chat-nova-item__avatar--placeholder"
                          />
                          <span className="chat-nova-item__nome">{p.nome}</span>
                          <span className="chat-nova-item__hint">{TEXTOS_INTERFACE.mensagens.hintConversar}</span>
                        </button>
                      ))
                    )}
                  </>
                )}

                {!showNova && lista.length === 0 && (
                  <div className="chat-list__empty">
                    <p>{TEXTOS_INTERFACE.mensagens.emptyTitulo}</p>
                    <p>{TEXTOS_INTERFACE.mensagens.emptyDica}</p>
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
            onVoltar={() => {
              setNovoDestinatario(null);
              setShowNova(true);
            }}
          />
        ) : selecionada && perfilId ? (
          <ConversaAtiva
            conversa={selecionada}
            perfilId={perfilId}
            onVoltar={() => setSelecionada(null)}
            onNovaMensagemRef={conversaAtivaHandlerRef}
            onMensagemEnviada={handleMensagemEnviada}
            onMensagemApagada={handleMensagemApagada}
          />
        ) : (
          <div className="chat-placeholder">
            <ChatIcon />
            <span>{TEXTOS_INTERFACE.mensagens.placeholderDesktop}</span>
          </div>
        )}
      </div>
  );
}

export default Chat;
