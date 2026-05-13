import { listaComprasApi } from '../http';
import type { ProdutoSubstituivel } from '../../types';

const mapProdutoSubstituivel = (dto: any): ProdutoSubstituivel => ({
    produtoAlertadoId: dto.produtoAlertadoId,
    produtoAlertadoNome: dto.produtoAlertadoNome,
    patologia: {
        id: dto.patologia.id,
        nome: dto.patologia.nome,
        descricao: dto.patologia.descricao,
    },
    produtoSugestao: dto.produtoSugestao
        ? {
            id: dto.produtoSugestao.id,
            nome: dto.produtoSugestao.nome,
            nomeNormalizado: dto.produtoSugestao.nomeNormalizado,
            preco: dto.produtoSugestao.preco,
            ativo: dto.produtoSugestao.ativo,
            isPersonalizado: dto.produtoSugestao.isPersonalizado,
            tags: dto.produtoSugestao.tags,
        }
        : null,
});

export const produtoService = {
    /**
     * Sugestoes para o produto alertado, baseadas nas patologias do usuario
     * autenticado (backend extrai userId do JWT).
     */
    async listarSubstituiveis(produtoId: number): Promise<ProdutoSubstituivel[]> {
        const { data } = await listaComprasApi.get<any[]>(
            `/produtos/${produtoId}/substituiveis`,
        );
        return data.map(mapProdutoSubstituivel);
    },

    /**
     * Sugestoes para uma patologia especifica (usado em templates).
     */
    async listarSubstituiveisPorPatologia(
        produtoId: number,
        patologiaId: number,
    ): Promise<ProdutoSubstituivel[]> {
        const { data } = await listaComprasApi.get<any[]>(
            `/produtos/${produtoId}/substituiveis-por-patologia`,
            { params: { patologiaId } },
        );
        return data.map(mapProdutoSubstituivel);
    },
};
