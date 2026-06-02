import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useEffect, useRef } from "react";
import { obterChatWebSocketUrl } from "../lib/chatWebSocketUrl";
import type { NovaMensagemEvent } from "../dto/menssagem/response/NovaMensagemEvent";

const FILA_MENSAGENS = "/user/queue/mensagens";

interface Options {
  enabled?: boolean;
  onNovaMensagem: (event: NovaMensagemEvent) => void;
}

export function useChatSocket({ enabled = true, onNovaMensagem }: Options) {
  const onNovaMensagemRef = useRef(onNovaMensagem);
  onNovaMensagemRef.current = onNovaMensagem;

  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(obterChatWebSocketUrl()),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(FILA_MENSAGENS, (message: IMessage) => {
          try {
            const event = JSON.parse(message.body) as NovaMensagemEvent;
            onNovaMensagemRef.current(event);
          } catch {
            /* payload inválido — ignorar */
          }
        });
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [enabled]);
}
