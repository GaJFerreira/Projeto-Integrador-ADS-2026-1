import api from "./Api";

/** URL SockJS do endpoint STOMP configurado no backend. */
export function obterChatWebSocketUrl(): string {
  const base = api.defaults.baseURL ?? "http://localhost:8080/api/sabor-familia";
  return `${base.replace(/\/$/, "")}/ws`;
}
