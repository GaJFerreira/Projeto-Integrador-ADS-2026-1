import "./conversaAtiva.css";
import SendIcon from "../../../icon/messagem/SendIcon";
import { useState } from "react";
import { useEnviarMensagem } from "../../../hooks/UseConversa";
import type { PerfilResumoResponse } from "../../../dto/perfil/response/PerfilResumoResponse";
import { ContextoMidiaPerfil } from "../../../dto/enums/ContextoMidiaEnum";
import { PerfilAvatar } from "../../common/PerfilAvatar";
import { TEXTOS_INTERFACE, textoEnviePrimeiraMensagem } from "../../../utils/textosInterface";

interface Props {
  destinatario: PerfilResumoResponse;
  onConversaCriada: (conversaId: number) => void;
  onVoltar?: () => void;
}

export function NovaConversa({ destinatario, onConversaCriada, onVoltar }: Props) {
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
          perfilId={destinatario.perfilId}
          possuiMidia={destinatario.possuiMidia}
          contexto={ContextoMidiaPerfil.CAPA_PERFIL}
          alt={destinatario.nome}
          className="chat-messages-header__avatar"
          placeholderClassName="chat-messages-header__avatar chat-messages-header__avatar--placeholder"
        />
        <div>
          <span className="chat-messages-header__label">
            {TEXTOS_INTERFACE.mensagens.novaMensagemPara}
          </span>
          <div className="chat-messages-header__name">{destinatario.nome}</div>
        </div>
      </div>

      <div className="chat-nova-conversa__lead">
        <span>{textoEnviePrimeiraMensagem(destinatario.nome)}</span>
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
