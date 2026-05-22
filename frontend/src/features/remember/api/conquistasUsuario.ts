import http from '@/lib/http';

const REMEMBER_API = '/api/remember';

export interface ConquistaDetalhes {
    identificadorConquista: number;
    nome: string;
    descricao: string;
    pontos: number;
    icone: string;
    tipo: string;
    meta: number;
}

export interface UsuarioConquistaDTO {
    identificadorUsuario: number;
    dataObtencao: string | null;
    conquista: ConquistaDetalhes;
}

export interface RankingItem {
    nomeUsuario: string;
    totalPontos: number;
}

export const conquistasUsuarioApi = {
    listarProgresso: async (usuarioId: number): Promise<UsuarioConquistaDTO[]> => {
        const { data } = await http.get<UsuarioConquistaDTO[]>(`${REMEMBER_API}/usuario-conquistas/${usuarioId}`);
        return data;
    },
    buscarRanking: async (): Promise<RankingItem[]> => {
        const { data } = await http.get<RankingItem[]>(`${REMEMBER_API}/usuario-conquistas/ranking`);
        return data;
    }
};
