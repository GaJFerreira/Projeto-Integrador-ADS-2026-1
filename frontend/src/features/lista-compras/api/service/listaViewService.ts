import { listaComprasApi } from '../http';
import type { Produto } from '../../types';

export type ItemListaDTO = {
    produtoId: number;
    qtd: number;
    produto?: Produto;
};

export type ListaDTO = {
    id: number;
    titulo: string;
    usuarioId?: number;
    patologiaId?: number | null;
    isTemplate?: boolean | null;
    template: boolean;
    createdAt: string;
    status?: 'ABERTA' | 'FINALIZADA';
    itens?: ItemListaDTO[];
};

export const listaViewService = {
    /**
     * Lista as listas (nao-template) do usuario autenticado.
     */
    async listarDoUsuario(): Promise<ListaDTO[]> {
        const { data } = await listaComprasApi.get<any[]>('/listas');
        return mapBackendData(data);
    },

    /**
     * Lista templates compativeis com as patologias do usuario autenticado.
     */
    async listarTemplates(): Promise<ListaDTO[]> {
        const { data } = await listaComprasApi.get<any[]>('/listas/templates');
        return mapBackendData(data);
    },

    async buscarPorId(id: number): Promise<ListaDTO> {
        const { data } = await listaComprasApi.get<any>(`/listas/${id}`);
        return mapBackendData([data])[0];
    },
};

function mapBackendData(data: any[]): ListaDTO[] {
    return data.map((lista) => ({
        ...lista,
        itens: lista.itens?.map((item: any) => ({
            ...item,
            qtd: item.quantidade ?? item.qtd,
        })),
    }));
}
