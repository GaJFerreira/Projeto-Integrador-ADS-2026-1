import api from "../lib/Api";
import { criarFormDataMultipart } from "../lib/multipartUtils";
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

  explorarPerfis: async (
    page = 0,
    size = 20,
    nome?: string
  ): Promise<PageResponse<PerfilResumoResponse>> => {
    const { data } = await api.get<PageResponse<PerfilResumoResponse>>("/perfil/explorar", {
      params: {
        page,
        size,
        sort: "dataCadastro,desc",
        ...(nome && { nome }),
      },
    });
    return data;
  },

  criarPerfil: async (
    request: PerfilRequest,
    arquivo?: File | null
  ): Promise<PerfilResponse> => {
    const formData = criarFormDataMultipart(request, arquivo);
    const { data } = await api.post<PerfilResponse>("/perfil", formData);
    return data;
  },
 
  editarPerfil: async (
    request: EditarPerfilRequest,
    arquivo?: File | null
  ): Promise<PerfilResponse> => {
    const formData = criarFormDataMultipart(request, arquivo);
    const { data } = await api.put<PerfilResponse>("/perfil", formData);
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
