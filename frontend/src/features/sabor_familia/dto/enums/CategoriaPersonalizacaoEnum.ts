export type CategoriaPersonalizacaoEnum =
  | "TEMPO_E_ESFORCO"
  | "CUSTO_E_ACESSO"
  | "ESTILO_E_MEMORIA"
  | "CONTEXTO_DE_CONSUMO"
  | "UTENSILIOS_E_EQUIPAMENTOS";

interface CategoriaInfo {
  label: string;
  descricao: string;
}

export const CategoriaPersonalizacaoInfo: Record<CategoriaPersonalizacaoEnum, CategoriaInfo> = {
  TEMPO_E_ESFORCO: {
    label: "Tempo e Esforço",
    descricao: "Define o nível de praticidade com base em tempo e trabalho envolvido",
  },
  CUSTO_E_ACESSO: {
    label: "Custo e Acesso",
    descricao: "Custo e facilidade de acesso aos ingredientes",
  },
  ESTILO_E_MEMORIA: {
    label: "Estilo e Memória",
    descricao: "Relaciona o estilo da receita e conexões afetivas ou culturais",
  },
  CONTEXTO_DE_CONSUMO: {
    label: "Contexto de Consumo",
    descricao: "Define o momento ou ocasião ideal de consumo",
  },
  UTENSILIOS_E_EQUIPAMENTOS: {
    label: "Utensílios e Equipamentos",
    descricao: "Indica os recursos de cozinha exigidos pela receita",
  },
};
