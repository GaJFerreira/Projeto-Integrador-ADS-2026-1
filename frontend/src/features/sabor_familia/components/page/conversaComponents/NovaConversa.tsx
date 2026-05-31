import "./conversaAtiva.css";
import SendIcon from "../../../icon/messagem/SendIcon";
import { useState } from "react";
import { useEnviarMensagem } from "../../../hooks/UseConversa";
import type { PerfilResumoResponse } from "../../../dto/perfil/response/PerfilResumoResponse";
import { ContextoMidiaPerfil } from "../../../dto/enums/ContextoMidiaEnum";
import { PerfilAvatar } from "../../common/PerfilAvatar";

interface Props {
  destinatario: PerfilResumoResponse;
  onConversaCriada: (conversaId: number) => void;
}

export function NovaConversa({ destinatario, onConversaCriada }: Props) {
  const { enviar, loading: enviando } = useEnviarMensagem();
  const [texto, setTexto] = useState("");

  const handleEnviar = async () => {
    const msg = texto.trim();
    if (!msg || enviando) return;
    setTexto("");
    await enviar(
      { destinatarioId: destinatario.usuarioId, mensagem: msg },
      (resp) => onConversaCriada(resp.conversaId)
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
      {/* Cabeçalho com o destinatário */}
      <div className="chat-messages-header">
        <PerfilAvatar
          perfilId={destinatario.perfilId}
          possuiMidia={destinatario.possuiMidia}
          contexto={ContextoMidiaPerfil.CAPA_PERFIL}
          alt={destinatario.nome}
          className="chat-messages-header__avatar"
          placeholderClassName="chat-messages-header__avatar chat-messages-header__avatar--placeholder"
        />
        <div>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
            Nova mensagem para
          </span>
          <div className="chat-messages-header__name">{destinatario.nome}</div>
        </div>
      </div>

      {/* Área central indicando conversa vazia */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
        fontSize: 14,
        fontFamily: "var(--font-sans)",
        gap: 8,
        opacity: 0.6,
      }}>
        <span>Envie a primeira mensagem para {destinatario.nome}</span>
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <textarea
          className="chat-input"
          rows={1}
          placeholder={`Mensagem para ${destinatario.nome}…`}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
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
