import http from '@/lib/http';

const REMEMBER_API = '/api/remember';

export type StatusPerguntaFiltro = 'PENDENTES' | 'RESPONDIDAS';

export interface PerguntaTemplate {
    identificadorPerguntaTemplate: number;
    textoTemplate: string;
    gatilhoTipo: number;
    gatilhoValores?: string;
    campoAlvo?: string;
    campoPlaceholder?: string;
    ativo: boolean;
}

export interface CreatePerguntaTemplatePayload {
    textoTemplate: string;
    gatilhoTipo: number;
    gatilhoValores?: string;
    campoAlvo?: string;
    campoPlaceholder?: string;
    ativo: boolean;
}

export interface PerguntaCognitiva {
    identificadorPerguntaCognitiva: number;
    identificadorTemplateOrigem: number;
    identificadorUsuario: number;
    identificadorLembranca?: number;
    identificadorDiario?: number;
    textoPergunta: string;
    status: 'ENVIADA' | 'RESPONDIDA';
    dataGeracao: string;
}

export interface RespostaPergunta {
    identificadorRespostaPerguntaUsuario: number;
    identificadorPergunta: number;
    identificadorUsuario: number;
    textoResposta: string;
    dataResposta: string;
}

export interface CreateRespostaPerguntaPayload {
    identificadorPergunta: number;
    textoResposta: string;
}

export const perguntasApi = {
    criarTemplate: async (payload: CreatePerguntaTemplatePayload): Promise<PerguntaTemplate> => {
        const { data } = await http.post<PerguntaTemplate>(`${REMEMBER_API}/pergunta-templates`, payload);
        return data;
    },
    gerar: async (): Promise<PerguntaCognitiva | null> => {
        const response = await http.get<PerguntaCognitiva>(`${REMEMBER_API}/perguntas-cognitivas/gerar`);
        return response.status === 204 ? null : response.data;
    },
    listar: async (status?: StatusPerguntaFiltro): Promise<PerguntaCognitiva[]> => {
        const { data } = await http.get<PerguntaCognitiva[]>(`${REMEMBER_API}/perguntas-cognitivas`, {
            params: status ? { status } : undefined,
        });
        return data;
    },
    responder: async (payload: CreateRespostaPerguntaPayload): Promise<RespostaPergunta> => {
        const { data } = await http.post<RespostaPergunta>(`${REMEMBER_API}/respostas-perguntas`, payload);
        return data;
    },
    listarRespostas: async (): Promise<RespostaPergunta[]> => {
        const { data } = await http.get<RespostaPergunta[]>(`${REMEMBER_API}/respostas-perguntas`);
        return data;
    },
};
