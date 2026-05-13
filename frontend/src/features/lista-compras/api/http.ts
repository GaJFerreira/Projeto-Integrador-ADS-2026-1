import http from '@/lib/http';
import type { AxiosRequestConfig } from 'axios';

const PREFIX = '/api/lista-compras';

/**
 * Wrapper sobre o http global da plataforma. Mantem o token JWT injetado
 * pelo interceptor de auth e adiciona o prefixo do modulo.
 */
export const listaComprasApi = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    http.get<T>(`${PREFIX}${url}`, config),

  post: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    http.post<T>(`${PREFIX}${url}`, data, config),

  put: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    http.put<T>(`${PREFIX}${url}`, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    http.delete<T>(`${PREFIX}${url}`, config),
};
