export type Produto = {
    id: number;
    nome: string;
    nome_normalizado: string;
    ativo: boolean;
    is_personalizado: boolean;
};

export type ListaItemVM = {
    produto: Produto;
    qtd: number;
};

export type Template = {
    id: number;
    titulo: string;
    is_template: boolean;
    itens: { produto_id: number; qtd: number }[];
};

export type Patologia = {
    id: number;
    nome: string;
};

export type NivelRisco = 'baixa' | 'media' | 'alta';

export type PatologiaItem = {
    patologia_id: number;
    produto_id: number;
    nivel?: NivelRisco;
};

export interface PatologiaDTO {
    id: number;
    nome: string;
    descricao?: string;
}

export interface ProdutoSugestaoDTO {
    id: number;
    nome: string;
    nomeNormalizado?: string;
    preco?: number;
    ativo?: boolean;
    isPersonalizado?: boolean;
    tags?: string;
}

export interface ProdutoSubstituivel {
    produtoAlertadoId: number;
    produtoAlertadoNome: string;
    patologia: PatologiaDTO;
    produtoSugestao: ProdutoSugestaoDTO | null;
}

export interface ListaDTO {
    id: number;
    titulo: string;
    usuarioId?: number;
    patologiaId?: number | null;
    template?: boolean;
    createdAt: string;
    descricao?: string | null;
    status?: string | null;
    itens?: {
        produtoId: number;
        quantidade: number;
        produto: {
            id: number;
            nome: string;
            nomeNormalizado?: string;
            ativo?: boolean;
            isPersonalizado?: boolean;
        };
    }[];
}

export interface PatologiaItemResponseDTO {
    patologiaId: number;
    produtoId: number;
    nivelRisco: 'BAIXA' | 'MEDIA' | 'ALTA';
    produto?: { id: number; nome: string };
}
