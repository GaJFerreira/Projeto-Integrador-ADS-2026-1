package br.com.puc.saborfamilia.database.enums;

import lombok.Getter;

@Getter
public enum CategoriaPersonalizacaoEnum {
  TEMPO_E_ESFORCO("Tempo e Esforço", "Define o nível de praticidade com base em tempo e trabalho envolvido"),
  CUSTO_E_ACESSO("Custo e Acesso", "Custo e facilidade de acesso aos ingredientes"),
  ESTILO_E_MEMORIA("Estilo e Memória", "Relaciona o estilo da receita e conexões afetivas ou culturais"),
  CONTEXTO_DE_CONSUMO("Contexto de Consumo", "Define o momento ou ocasião ideal de consumo"),
  UTENSILIOS_E_EQUIPAMENTOS("Utensílios e Equipamentos", "Indica os recursos de cozinha exigidos pela receita");

  private final String label;
  private final String descricao;

  CategoriaPersonalizacaoEnum(String label, String descricao) {
    this.label = label;
    this.descricao = descricao;
  }
}
