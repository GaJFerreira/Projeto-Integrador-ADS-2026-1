import http from '@/lib/http';

const BASE = '/api/lista-compras/admin/produtos';
const CATEGORIAS_BASE = '/api/lista-compras/categorias';

export interface AdminCategoria {
  id: number;
  nome: string;
  descricao?: string;
}

export interface AdminProduto {
  id: number;
  nome: string;
  nomeNormalizado?: string;
  marca?: string;
  unidadeMedida?: string;
  categoria?: AdminCategoria;

  // custo
  preco?: number | null;
  custoMedio?: number | null;
  custoMedioAtualizadoEm?: string | null;

  // nutricao
  porcaoReferenciaGramas?: number | null;
  calorias?: number | null;
  proteinas?: number | null;
  carboidratos?: number | null;
  gordurasTotais?: number | null;
  gordurasSaturadas?: number | null;
  fibras?: number | null;
  sodio?: number | null;
  acucares?: number | null;

  // metadata
  tags?: string;
  ativo?: boolean;
  isPersonalizado?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProdutoPayload {
  nome: string;
  categoriaId: number;
  marca?: string | null;
  unidadeMedida?: string | null;

  custoMedio?: number | null;

  porcaoReferenciaGramas?: number | null;
  calorias?: number | null;
  proteinas?: number | null;
  carboidratos?: number | null;
  gordurasTotais?: number | null;
  gordurasSaturadas?: number | null;
  fibras?: number | null;
  sodio?: number | null;
  acucares?: number | null;

  tags?: string | null;
  ativo?: boolean;
}

export const adminProdutosApi = {
  listar: async (): Promise<AdminProduto[]> => {
    const { data } = await http.get<AdminProduto[]>(BASE);
    return Array.isArray(data) ? data : [];
  },
  porId: async (id: number): Promise<AdminProduto> => {
    const { data } = await http.get<AdminProduto>(`${BASE}/${id}`);
    return data;
  },
  criar: async (payload: AdminProdutoPayload): Promise<AdminProduto> => {
    const { data } = await http.post<AdminProduto>(BASE, payload);
    return data;
  },
  atualizar: async (id: number, payload: AdminProdutoPayload): Promise<AdminProduto> => {
    const { data } = await http.put<AdminProduto>(`${BASE}/${id}`, payload);
    return data;
  },
  atualizarCusto: async (id: number, custoMedio: number): Promise<AdminProduto> => {
    const { data } = await http.patch<AdminProduto>(`${BASE}/${id}/custo`, { custoMedio });
    return data;
  },
  desativar: async (id: number): Promise<void> => {
    await http.delete(`${BASE}/${id}`);
  },
  listarCategorias: async (): Promise<AdminCategoria[]> => {
    const { data } = await http.get<AdminCategoria[]>(CATEGORIAS_BASE);
    return Array.isArray(data) ? data : [];
  },
};
