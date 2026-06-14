import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useChatSocketConnection } from "../hooks/UseChatSocket";
import type { EventoMensagemWs } from "../dto/menssagem/response/EventoMensagemWs";

type ChatSocketListener = (event: EventoMensagemWs) => void;

interface ChatSocketContextValue {
  subscribe: (listener: ChatSocketListener) => () => void;
  connected: boolean;
}

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

export function ChatSocketProvider({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  const listenersRef = useRef(new Set<ChatSocketListener>());
  const [connected, setConnected] = useState(false);

  const notify = useCallback((event: EventoMensagemWs) => {
    listenersRef.current.forEach((listener) => listener(event));
  }, []);

  useChatSocketConnection({
    enabled,
    onNovaMensagem: notify,
    onConnectionChange: setConnected,
  });

  const subscribe = useCallback((listener: ChatSocketListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const value = useMemo(
    () => ({ subscribe, connected }),
    [subscribe, connected]
  );

  return (
    <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>
  );
}

/** Registra handler de mensagens em tempo real (ex.: página de chat). */
export function useChatSocketSubscription(
  listener: ChatSocketListener,
  enabled = true
) {
  const ctx = useContext(ChatSocketContext);
  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    if (!ctx || !enabled) return;

    return ctx.subscribe((event) => listenerRef.current(event));
  }, [ctx, enabled]);
}

export function useChatSocketStatus() {
  return useContext(ChatSocketContext)?.connected ?? false;
}
