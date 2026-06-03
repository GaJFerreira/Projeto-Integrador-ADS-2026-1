/**
 * Textos visíveis da interface (menus, botões, mensagens, confirmações).
 * Centralizado para facilitar revisão e manutenção.
 */
export const TEXTOS_INTERFACE = {
  menu: {
    inicio: { titulo: "Início", explicacao: "Receitas de quem você segue" },
    descobrir: { titulo: "Descobrir", explicacao: "Pessoas e receitas novas" },
    mensagens: { titulo: "Mensagens", explicacao: "Conversar com amigos" },
    favoritos: { titulo: "Receitas salvas", explicacao: "Receitas que você salvou" },
    publicarReceita: { titulo: "Publicar receita", explicacao: "Compartilhar uma receita" },
    meuPerfil: { titulo: "Meu perfil", explicacao: "Ver sua página" },
    configuracoes: { titulo: "Configurações", explicacao: "Ajustar sua conta" },
  },
  menuInferior: {
    rotulo: "Menu principal do Sabor da Família",
    inicio: "Início",
    descobrir: "Descobrir",
    mensagens: "Mensagens",
    salvas: "Salvas",
    perfil: "Perfil",
    publicar: "Publicar",
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
    emptyTitulo: "Bem-vindo(a) ao Sabor da Família!",
    emptyLead1:
      "Seu perfil foi criado com sucesso. Esta tela é o Início. Aqui aparecem as receitas das pessoas que você segue.",
    emptyLead2:
      "Como você acabou de entrar, ainda não há receitas para mostrar. Isso é normal.",
    emptyPasso1:
      "Toque em Descobrir no menu. Leia: “Pessoas e receitas novas”.",
    emptyPasso2:
      "Escolha a opção Pessoas. Encontre pessoas que você goste.",
    emptyPasso3:
      "Abra um perfil e toque em Seguir esta pessoa. As receitas dela passam a aparecer aqui no Início.",
    emptyDicaPublicar:
      "Você também pode publicar a sua primeira receita em Publicar receita no menu.",
    verReceitaDetalhe: "Ver detalhes da receita",
  },
  descobrir: {
    titulo: "Descobrir",
    subtitulo: "Encontre pessoas e receitas novas para você",
    rotuloAbas: "Buscar receitas ou pessoas",
    abaReceitas: "Receitas",
    abaPessoas: "Pessoas",
    buscaReceita: "Buscar receita pelo nome…",
    buscaPessoa: "Buscar pessoa pelo nome…",
    receitaRestrita: "Não indicada para você",
  },
  favoritos: {
    titulo: "Receitas salvas",
    subtitulo: "Receitas que você salvou para ver depois",
    mensagemVazia: "Você ainda não salvou nenhuma receita.",
    passo1: "Abra Início ou Descobrir no menu de baixo.",
    passo2: "Toque em Salvar receita na que gostar.",
  },
  mensagens: {
    titulo: "Mensagens",
    subtitulo: "Conversar com amigos",
    iniciarConversa: "Iniciar conversa",
    emptyTitulo: "Você ainda não tem conversas.",
    emptyDica: "Toque no botão abaixo para começar.",
    carregando: "Carregando conversas…",
    secaoConversas: "Conversas",
    secaoSeguindo: "Pessoas que você segue",
    hintConversar: "Conversar",
    semSeguindo: "Você não segue ninguém ainda.",
    placeholderDesktop: "Selecione uma conversa ou toque em Iniciar conversa",
    carregarAnteriores: "Carregar mensagens anteriores",
    carregandoMensagens: "Carregando mensagens…",
    semMensagens: "Escreva a primeira mensagem",
    digiteMensagem: "Digite uma mensagem…",
    novaMensagemPara: "Nova mensagem para",
    textoApagada: "Mensagem apagada",
    apagarMensagem: "Apagar mensagem",
    confirmarApagarMensagem: "Apagar esta mensagem para todos na conversa?",
  },
  receita: {
    salvarFavoritos: "Salvar receita",
    salvaFavoritos: "Receita salva",
    salvarFavoritosMobile: "Salvar receita",
    salvaFavoritosMobile: "Receita salva",
    descricaoSalvarFavoritos: "Salvar esta receita",
    descricaoRemoverFavoritos: "Remover receita salva",
    caracteristicasTitulo: "Características",
    caracteristicasDesc: "Caracterize sua receita para que mais pessoas a encontrem.",
    carregandoCaracteristicas: "Carregando opções…",
    fotoHintManter:
      "Deixe em branco para manter a foto atual. Foto em JPG ou PNG, no máximo 1,5 MB.",
    suaReceita: "Sua receita",
    editar: "Editar",
  },
  perfil: {
    statReceitas: "receitas",
    statSeguidores: "seguidores",
    statSeguindo: "seguindo",
    secaoSobre: "Sobre",
    secaoSobreHint: "Um pouco sobre esta pessoa",
    secaoPreferencias: "Preferências",
    secaoPreferenciasHint: "Interesses e estilo culinário deste perfil",
    secaoRestricoes: "Restrições alimentares",
    secaoRestricoesHint: "Restrições que ajudam a encontrar receitas adequadas",
    gridTitulo: "Receitas",
    gridVazia: "Nenhuma receita publicada ainda.",
    editarPerfil: "Editar perfil",
  },
  formulario: {
    sobreVoce: "Sobre você",
    sobreVocePlaceholder: "Conte um pouco sobre você…",
    sobreVoceCadastroPlaceholder: "Fale um pouco sobre você e sua relação com a cozinha…",
    fotoHint: "Foto em JPG ou PNG, no máximo 1,5 MB",
    fotoErroTipo: "Use uma foto em JPG ou PNG.",
    fotoErroTamanho: "A foto deve ter no máximo 1,5 MB.",
    escolherImagem: "Escolher imagem",
    trocarImagem: "Trocar imagem",
    removerImagem: "Remover",
    preferenciasTitulo: "Preferências",
    preferenciasDescPerfil: "Escolha opções que combinam com você.",
    restricoesDescConfig: "Marque suas restrições para receber receitas adequadas.",
    nenhumaOpcao: "Nenhuma opção disponível.",
    nenhumaRestricao: "Nenhuma restrição disponível.",
    contaPreenchida: "Nome e e-mail foram preenchidos com os dados da sua conta.",
    dadosDescCadastro: "Informe nome e e-mail para criar seu perfil.",
    criandoPerfil: "Criando perfil…",
    criarPerfil: "Criar perfil",
    jaTemPerfil: "Já tem um perfil?",
    entrar: "Entrar",
    salvando: "Salvando…",
    salvarAlteracoes: "Salvar alterações",
    salvar: "Salvar",
  },
  acoes: {
    apagar: "Apagar",
    apagando: "Apagando…",
    apagarComentarioComoAutorReceita: "Remover comentário da sua publicação",
    comentarios: "Comentários",
    fechar: "Fechar",
    comentariosVazios: "Nenhum comentário ainda.",
    enviar: "Enviar",
  },
  comum: {
    carregando: "Carregando…",
    voltarInicio: "Voltar ao início",
    verificandoPerfil: "Verificando seu perfil…",
    erroVerificarPerfil: "Não foi possível verificar seu perfil. Tente novamente.",
  },
  erros: {
    catalogo: "Erro ao carregar opções.",
    restricoes: "Erro ao carregar restrições alimentares.",
    caracteristicasReceita: "Erro ao carregar características da receita.",
    curtida: "Erro ao curtir.",
    salvarReceita: "Erro ao salvar receita.",
    comentarios: "Erro ao carregar comentários.",
    adicionarComentario: "Erro ao enviar comentário.",
    removerComentario: "Erro ao apagar comentário.",
    conversas: "Erro ao carregar conversas.",
    mensagens: "Erro ao carregar mensagens.",
    mensagensAnteriores: "Erro ao carregar mensagens anteriores.",
    enviarMensagem: "Erro ao enviar mensagem.",
    apagarMensagem: "Erro ao apagar mensagem.",
    favorito: "Erro ao salvar receita.",
    comentarioVazio: "O comentário não pode estar vazio.",
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
    receitaPublicada: "Receita publicada com sucesso",
    receitaAtualizada: "Receita atualizada com sucesso",
    receitaSalvaFavoritos: "Receita salva",
    receitaRemovidaFavoritos: "Receita removida das salvas",
    comentarioRemovido: "Comentário removido",
    mensagemApagada: "Mensagem apagada",
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

export function textoBoasVindasInicio(nome?: string): string {
  const primeiro = nome?.trim().split(/\s+/)[0];
  return primeiro
    ? `Bem-vindo(a), ${primeiro}!`
    : TEXTOS_INTERFACE.inicio.emptyTitulo;
}

export function textoEnviePrimeiraMensagem(nome: string): string {
  return `Envie a primeira mensagem para ${nome}`;
}

function textoPerguntaApagarReceita(titulo?: string): string {
  const nome = titulo?.trim();
  if (nome) {
    return `Deseja apagar a receita “${nome}”? Ela sumirá do seu perfil.`;
  }
  return "Deseja apagar esta receita? Ela sumirá do seu perfil.";
}

export function opcoesDialogoApagarMensagem(): OpcoesDialogoConfirmacao {
  return {
    titulo: TEXTOS_INTERFACE.mensagens.apagarMensagem,
    mensagem: TEXTOS_INTERFACE.mensagens.confirmarApagarMensagem,
    textoConfirmar: TEXTOS_INTERFACE.confirmacao.apagarReceita.confirmar,
    textoCancelar: TEXTOS_INTERFACE.confirmacao.apagarReceita.cancelar,
    acaoPerigosa: true,
  };
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
