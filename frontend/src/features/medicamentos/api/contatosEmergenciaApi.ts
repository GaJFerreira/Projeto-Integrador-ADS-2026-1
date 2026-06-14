import http from "@/lib/http";

export interface CreateContatoPayload {

  nome: string;
  telefone: string;
  relacao?: string;
}

export interface UpdateContatoPayload {

  nome: string;
  telefone: string;
  relacao?: string;
}

export interface ContatoEmergencia {
  id: number;
  nome: string;
  telefone: string;
  relacao?: string;

}

export const contatosEmergenciaApi = {
  listar: async () => {
    const { data } = await http.get<ContatoEmergencia[]>(
       `/api/dose-certa/contatos-emergencia/meus`
    );
    return data;
  },

  criar: async (payload: CreateContatoPayload) => {
    const { data } = await http.post<ContatoEmergencia>(
       `/api/dose-certa/contatos-emergencia`,
      payload
    );
    return data;
  },

  atualizar: async (id: number, payload: UpdateContatoPayload) => {
    const { data } = await http.put<ContatoEmergencia>(
       `/api/dose-certa/contatos-emergencia/${id}`,
      payload
    );
    return data;
  },

  excluir: async (id: number) => {
    await http.delete(`/api/dose-certa/contatos-emergencia/${id}`);
  },
};
