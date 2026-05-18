import http from '@/lib/http';

const REMEMBER_API = '/api/remember';

export interface Conquista {
    identificadorConquista: number;
    nome: string;
    descricao: string;
    meta: number;
    pontos: number;
    tipo: string;
    icone: string;
}

export interface CreateConquistaPayload {
    nome: string;
    descricao: string;
    meta: number;
    pontos: number;
    tipo: number;
    icone: string;
}

export interface UpdateConquistaPayload {
    nome: string;
    descricao: string;
}

export const adminConquistasApi = {
    listar: async (): Promise<Conquista[]> => {
        const { data } = await http.get<Conquista[]>(`${REMEMBER_API}/conquistas`, {
            timeout: 0,
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });
        return data;
    },
    criar: async (payload: CreateConquistaPayload): Promise<Conquista> => {
        const { data } = await http.post<Conquista>(`${REMEMBER_API}/conquistas`, payload);
        return data;
    },
    porId: async (id: number): Promise<Conquista> => {
        const { data } = await http.get<Conquista>(`${REMEMBER_API}/conquistas/${id}`);
        return data;
    },
    atualizar: async (id: number, payload: UpdateConquistaPayload): Promise<Conquista> => {
        const { data } = await http.put<Conquista>(`${REMEMBER_API}/conquistas/${id}`, payload);
        return data;
    },
    remover: async (id: number): Promise<void> => {
        await http.delete(`${REMEMBER_API}/conquistas/${id}`);
    },
};
