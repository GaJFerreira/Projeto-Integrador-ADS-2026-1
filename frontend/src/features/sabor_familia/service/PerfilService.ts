import api from "../lib/Api";
import type { PerfilResponse } from "../dto/perfil/response/PerfilResponse";
import type { PerfilRequest } from "../dto/perfil/request/PerfilRequest";
import type { EditarPerfilRequest } from "../dto/perfil/request/EditarPerfilRequest";
import type { PerfilResumoResponse } from "../dto/perfil/response/PerfilResumoResponse";
import type { PageResponse } from "../dto/page/PageResponse";
import type { SeguindoResponse } from "../dto/seguindo/SeguindoResponse";

export const perfilService = {
  buscarPerfilPublico: async (perfilId: number): Promise<PerfilResponse> => {
    const { data } = await api.get<PerfilResponse>(`/perfil/${perfilId}`);
    return data;
  },

  buscarMeuPerfil: async (): Promise<PerfilResponse> => {
    const { data } = await api.get<PerfilResponse>("/perfil");
    return data;
  },

  criarPerfil: async (request: PerfilRequest): Promise<PerfilResponse> => {
    const { data } = await api.post<PerfilResponse>("/perfil", request);
    return data;
  },
 
  editarPerfil: async (request: EditarPerfilRequest): Promise<PerfilResponse> => {
    const { data } = await api.put<PerfilResponse>("/perfil", request);
    return data;
  },
 
  buscarSeguidores: async (
    perfilId: number,
    page = 0,
    size = 20
  ): Promise<PageResponse<PerfilResumoResponse>> => {
    const { data } = await api.get<PageResponse<PerfilResumoResponse>>(
      `/perfil/${perfilId}/seguidores`,
      { params: { page, size } }
    );
    return data;
  },
 
  buscarSeguindo: async (
    perfilId: number,
    page = 0,
    size = 20
  ): Promise<PageResponse<PerfilResumoResponse>> => {
    const { data } = await api.get<PageResponse<PerfilResumoResponse>>(
      `/perfil/${perfilId}/seguindo`,
      { params: { page, size } }
    );
    return data;
  },
 
  seguirPerfil: async (perfilId: number): Promise<SeguindoResponse> => {
    const { data } = await api.post<SeguindoResponse>(`/perfil/${perfilId}/seguir`);
    return data;
  },
 
  deixarSeguirPerfil: async (perfilId: number): Promise<SeguindoResponse> => {
    const { data } = await api.delete<SeguindoResponse>(`/perfil/${perfilId}/seguir`);
    return data;
  },

};
