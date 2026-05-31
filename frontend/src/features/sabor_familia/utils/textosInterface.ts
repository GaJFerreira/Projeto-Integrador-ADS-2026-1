/**
 * Textos visíveis da interface (menus, botões, mensagens, confirmações).
 * Centralizado para facilitar revisão e manutenção.
 */
export const TEXTOS_INTERFACE = {
  menu: {
    inicio: { titulo: "Início", explicacao: "Receitas de quem você segue" },
    descobrir: { titulo: "Descobrir", explicacao: "Pessoas e receitas novas" },
    mensagens: { titulo: "Mensagens", explicacao: "Conversar com amigos" },
    favoritos: { titulo: "Receitas salvas", explicacao: "Suas receitas favoritas" },
    publicarReceita: { titulo: "Publicar receita", explicacao: "Compartilhar uma receita" },
    meuPerfil: { titulo: "Meu perfil", explicacao: "Ver sua página" },
    configuracoes: { titulo: "Configurações", explicacao: "Ajustar sua conta" },
  },
  seguir: {
    botaoSeguir: "Seguir esta pessoa",
    botaoSeguindo: "Você segue esta pessoa",
    botaoSeguirCurto: "Seguir esta pessoa",
    botaoSeguindoCurto: "Você segue",
  },
  inicio: {
    titulo: "Início",
    subtitulo: "Receitas de quem você segue",
    botaoSemReceitas: "Ir para Descobrir pessoas",
  },
  descobrir: {
    titulo: "Descobrir",
    subtitulo: "Encontre pessoas e receitas novas para você",
    rotuloAbas: "Buscar receitas ou pessoas",
    abaReceitas: "Receitas",
    abaPessoas: "Pessoas",
    buscaReceita: "Buscar receita pelo nome…",
    buscaPessoa: "Buscar pessoa pelo nome…",
  },
  favoritos: {
    titulo: "Receitas salvas",
    subtitulo: "Receitas que você marcou com Salvar nos favoritos",
    mensagemVazia: "Você ainda não salvou nenhuma receita.",
    dicaVazia:
      "No Início ou em Descobrir, toque em Salvar nos favoritos para guardá-las aqui — o mesmo ícone de marcador do menu ao lado.",
  },
  receita: {
    salvarFavoritos: "Salvar nos favoritos",
    salvaFavoritos: "Salva nos favoritos",
    descricaoSalvarFavoritos: "Salvar receita nos favoritos",
    descricaoRemoverFavoritos: "Remover receita dos favoritos",
  },
  carregamento: {
    receitas: "Carregando suas receitas…",
    receita: "Carregando receita…",
    receitasSalvas: "Carregando suas receitas salvas…",
    pessoas: "Carregando pessoas…",
    maisReceitas: "Carregando mais receitas…",
    comentarios: "Carregando comentários…",
  },
  confirmacao: {
    apagarReceita: {
      titulo: "Apagar receita",
      confirmar: "Sim, apagar",
      cancelar: "Não, manter",
    },
  },
  sucesso: {
    receitaSalvaFavoritos: "Receita salva nos favoritos",
    receitaRemovidaFavoritos: "Receita removida dos favoritos",
    seguirSemNome: "Você passou a seguir esta pessoa",
    deixarSeguirSemNome: "Você deixou de seguir esta pessoa",
  },
} as const;

export interface OpcoesDialogoConfirmacao {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  acaoPerigosa?: boolean;
}

export function textoPerguntaApagarReceita(titulo?: string): string {
  const nome = titulo?.trim();
  if (nome) {
    return `Deseja apagar a receita “${nome}”? Ela sumirá do seu perfil.`;
  }
  return "Deseja apagar esta receita? Ela sumirá do seu perfil.";
}

export function opcoesDialogoApagarReceita(titulo?: string): OpcoesDialogoConfirmacao {
  return {
    titulo: TEXTOS_INTERFACE.confirmacao.apagarReceita.titulo,
    mensagem: textoPerguntaApagarReceita(titulo),
    textoConfirmar: TEXTOS_INTERFACE.confirmacao.apagarReceita.confirmar,
    textoCancelar: TEXTOS_INTERFACE.confirmacao.apagarReceita.cancelar,
    acaoPerigosa: true,
  };
}

function primeiroNome(nome?: string): string | undefined {
  return nome?.trim().split(/\s+/)[0];
}

export function textoSucessoSeguir(nome?: string): string {
  const primeiro = primeiroNome(nome);
  return primeiro
    ? `Você passou a seguir ${primeiro}`
    : TEXTOS_INTERFACE.sucesso.seguirSemNome;
}

export function textoSucessoDeixarSeguir(nome?: string): string {
  const primeiro = primeiroNome(nome);
  return primeiro
    ? `Você deixou de seguir ${primeiro}`
    : TEXTOS_INTERFACE.sucesso.deixarSeguirSemNome;
}
