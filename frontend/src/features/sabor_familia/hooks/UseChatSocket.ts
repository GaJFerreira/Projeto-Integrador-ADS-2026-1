import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useEffect, useRef } from "react";
import { obterChatWebSocketUrl } from "../lib/chatWebSocketUrl";
import type { NovaMensagemEvent } from "../dto/menssagem/response/NovaMensagemEvent";

const FILA_MENSAGENS = "/user/queue/mensagens";

export interface UseChatSocketConnectionOptions {
  enabled?: boolean;
  onNovaMensagem: (event: NovaMensagemEvent) => void;
  onConnectionChange?: (connected: boolean) => void;
}

/** Mantém uma conexão STOMP/SockJS com o backend de mensagens. */
export function useChatSocketConnection({
  enabled = true,
  onNovaMensagem,
  onConnectionChange,
}: UseChatSocketConnectionOptions) {
  const onNovaMensagemRef = useRef(onNovaMensagem);
  const onConnectionChangeRef = useRef(onConnectionChange);

  onNovaMensagemRef.current = onNovaMensagem;
  onConnectionChangeRef.current = onConnectionChange;

  useEffect(() => {
    if (!enabled) {
      onConnectionChangeRef.current?.(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      onConnectionChangeRef.current?.(false);
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(obterChatWebSocketUrl()),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        onConnectionChangeRef.current?.(true);
        client.subscribe(FILA_MENSAGENS, (message: IMessage) => {
          try {
            const event = JSON.parse(message.body) as NovaMensagemEvent;
            onNovaMensagemRef.current(event);
          } catch {
            /* payload inválido — ignorar */
          }
        });
      },
      onDisconnect: () => {
        onConnectionChangeRef.current?.(false);
      },
      onStompError: () => {
        onConnectionChangeRef.current?.(false);
      },
      onWebSocketClose: () => {
        onConnectionChangeRef.current?.(false);
      },
    });

    client.activate();

    return () => {
      onConnectionChangeRef.current?.(false);
      void client.deactivate();
    };
  }, [enabled]);
}

/** @deprecated Prefira ChatSocketProvider + useChatSocketSubscription no layout do módulo. */
export function useChatSocket(options: UseChatSocketConnectionOptions) {
  useChatSocketConnection(options);
}
