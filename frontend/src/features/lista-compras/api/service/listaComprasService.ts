import { listaComprasApi } from '../http';
import type { Produto } from '../../types';
import type { ListaDeComprasDTO, ListaDeComprasSalva } from '../dtos';

export const listaComprasService = {

    /**
     * Autocomplete: busca produtos por nome (>= 3 chars).
     */
    async searchProdutosByNome(termo: string): Promise<Produto[]> {
        const clean = termo.trim();
        if (clean.length < 3) return [];

        const { data } = await listaComprasApi.get<any[]>(
            `/produtos/buscar?param=${encodeURIComponent(clean)}`
        );

        return data.map((dto: any) => ({
            id: dto.id,
            nome: dto.nome,
            nome_normalizado:
                dto.nomeNormalizado?.toLowerCase().trim()
                ?? dto.nome.toLowerCase().trim(),
            ativo: dto.ativo ?? true,
            is_personalizado: dto.isPersonalizado ?? false,
        }));
    },

    async criarLista(payload: ListaDeComprasDTO): Promise<ListaDeComprasSalva> {
        const { data } = await listaComprasApi.post<ListaDeComprasSalva>(
            '/listas',
            payload,
        );
        return data;
    },

    async atualizarLista(
        listaId: number,
        payload: ListaDeComprasDTO,
    ): Promise<ListaDeComprasSalva> {
        const { data } = await listaComprasApi.put<ListaDeComprasSalva>(
            `/listas/${listaId}`,
            payload,
        );
        return data;
    },

    async finalizarLista(listaId: number): Promise<ListaDeComprasSalva> {
        const { data } = await listaComprasApi.put<ListaDeComprasSalva>(
            `/listas/${listaId}/finalizar`,
        );
        return data;
    },

    async reabrirLista(id: number): Promise<void> {
        await listaComprasApi.put(`/listas/${id}/reabrir`);
    },
};
