import { listaComprasApi } from '../http';
import type { Patologia, PatologiaItemResponseDTO } from '../../types';

export const patologiasService = {
    /**
     * Patologias do usuario autenticado (backend extrai userId do JWT).
     */
    async getPatologiasDoUsuario(): Promise<Patologia[]> {
        const { data } = await listaComprasApi.get<Patologia[]>('/patologias');
        return data;
    },

    /**
     * Todas as patologias cadastradas (usado ao criar templates).
     */
    async getTodasPatologias(): Promise<Patologia[]> {
        const { data } = await listaComprasApi.get<Patologia[]>('/patologias/todas');
        return data;
    },

    async getPatologiaById(id: number): Promise<Patologia> {
        const { data } = await listaComprasApi.get<Patologia>(`/patologias/${id}`);
        return data;
    },

    async getItensDaPatologia(patologiaId: number): Promise<PatologiaItemResponseDTO[]> {
        const { data } = await listaComprasApi.get<PatologiaItemResponseDTO[]>(
            `/patologia-itens/patologia/${patologiaId}`,
        );
        return data;
    },
};
