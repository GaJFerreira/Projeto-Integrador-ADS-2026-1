import type { ErrorInfo } from "../dto/error/ErrorInfo";
import type { ErrorOrigem } from "../dto/error/ErrorOrigem";
import type { ErrorPageState } from "../dto/error/ErrorPageState";

export type { ErrorOrigem };

export interface ErrorOrigemConfig {
  contexto: string;
  returnTo: string;
  retryLabel: string;
}

export const CONFIG_ORIGEM: Record<ErrorOrigem, ErrorOrigemConfig> = {
  feed: {
    contexto: "ao carregar o Início",
    returnTo: "/sabor-familia/home",
    retryLabel: "Carregar o Início de novo",
  },
  explorar: {
    contexto: "ao buscar no Descobrir",
    returnTo: "/sabor-familia/explorar",
    retryLabel: "Tentar busca novamente",
  },
  perfil: {
    contexto: "ao abrir este perfil",
    returnTo: "/sabor-familia/home",
    retryLabel: "Tentar novamente",
  },
  receita: {
    contexto: "ao abrir esta receita",
    returnTo: "/sabor-familia/explorar",
    retryLabel: "Tentar novamente",
  },
  favoritos: {
    contexto: "ao carregar suas receitas salvas",
    returnTo: "/sabor-familia/favoritos",
    retryLabel: "Carregar receitas salvas de novo",
  },
  mensagens: {
    contexto: "ao carregar suas mensagens",
    returnTo: "/sabor-familia/mensagens",
    retryLabel: "Carregar conversas de novo",
  },
  configuracoes: {
    contexto: "ao salvar suas configurações",
    returnTo: "/sabor-familia/configuracoes",
    retryLabel: "Voltar às configurações",
  },
  cadastro: {
    contexto: "ao criar ou atualizar seu perfil",
    returnTo: "/sabor-familia/cadastro",
    retryLabel: "Voltar ao cadastro",
  },
  seguidores: {
    contexto: "ao carregar seguidores ou seguindo",
    returnTo: "/sabor-familia/home",
    retryLabel: "Tentar novamente",
  },
  comentarios: {
    contexto: "ao carregar comentários",
    returnTo: "/sabor-familia/home",
    retryLabel: "Tentar novamente",
  },
  catalogo: {
    contexto: "ao carregar opções do formulário",
    returnTo: "/sabor-familia/home",
    retryLabel: "Tentar novamente",
  },
  geral: {
    contexto: "ao processar sua solicitação",
    returnTo: "/sabor-familia/home",
    retryLabel: "Tentar novamente",
  },
};

export function obterConfigOrigem(origem: ErrorOrigem): ErrorOrigemConfig {
  return CONFIG_ORIGEM[origem] ?? CONFIG_ORIGEM.geral;
}

export const ERROR_MAP: Record<number, ErrorInfo> = {
  400: {
    title: "Não foi possível concluir",
    description:
      "Alguma informação enviada não foi aceita. Revise os dados e tente de novo.",
    icon: "warning",
    dicas: [
      "Confira se todos os campos obrigatórios estão preenchidos.",
      "Se enviou foto, use JPG ou PNG, no máximo 1,5 MB.",
    ],
  },
  401: {
    title: "Precisa entrar de novo",
    description:
      "Sua conta não está mais ativa aqui. Entre novamente para continuar usando o Sabor da Família.",
    icon: "lock",
    dicas: ["Use o mesmo e-mail e senha cadastrados na sua conta."],
  },
  403: {
    title: "Sem permissão",
    description: "Você não tem acesso a este conteúdo ou ação no momento.",
    icon: "lock",
    dicas: ["Se acredita que isso é um engano, fale com o suporte do projeto."],
  },
  404: {
    title: "Conteúdo não encontrado",
    description:
      "O endereço ou o item que você procurou não existe mais ou foi removido.",
    icon: "not-found",
    dicas: [
      "Volte ao início e navegue pelo menu.",
      "Use Descobrir para buscar receitas e pessoas.",
    ],
  },
  408: {
    title: "Conexão demorou demais",
    description:
      "A resposta demorou mais que o esperado. Verifique sua internet.",
    icon: "warning",
    dicas: ["Aguarde alguns segundos e tente outra vez."],
  },
  409: {
    title: "Dados desatualizados",
    description:
      "Algo mudou enquanto você agia. Atualize a página e tente novamente.",
    icon: "warning",
    dicas: ["Evite enviar o mesmo formulário duas vezes seguidas."],
  },
  422: {
    title: "Revise os campos",
    description:
      "Há informações inválidas no formulário. Corrija o que foi indicado e envie de novo.",
    icon: "warning",
    dicas: ["Os avisos costumam aparecer logo abaixo de cada campo."],
  },
  429: {
    title: "Muitas tentativas",
    description:
      "Você tentou várias vezes em pouco tempo. Aguarde um instante antes de continuar.",
    icon: "warning",
    dicas: ["Espere cerca de um minuto e tente novamente."],
  },
  500: {
    title: "Algo deu errado",
    description:
      "Ocorreu um problema interno. Tente novamente em alguns instantes.",
    icon: "server",
    dicas: [
      "Se o erro continuar, anote o que você estava fazendo e avise o suporte.",
    ],
  },
  502: {
    title: "Sistema indisponível",
    description:
      "Não recebemos uma resposta válida. O sistema pode estar reiniciando.",
    icon: "server",
    dicas: ["Aguarde um pouco e recarregue a página."],
  },
  503: {
    title: "Manutenção ou sobrecarga",
    description:
      "O serviço está temporariamente indisponível. Tente novamente em alguns minutos.",
    icon: "server",
    dicas: ["Aguarde alguns minutos e tente de novo."],
  },
};

export const FALLBACK_ERROR: ErrorInfo = {
  title: "Algo deu errado",
  description:
    "Não conseguimos completar esta ação. Você pode tentar de novo ou voltar ao início.",
  icon: "generic",
  dicas: [
    "Confira sua conexão com a internet.",
    "Se o problema persistir, entre em contato com o suporte.",
  ],
};

export function getErrorInfo(statusCode?: number): ErrorInfo {
  if (!statusCode) return FALLBACK_ERROR;
  return ERROR_MAP[statusCode] ?? FALLBACK_ERROR;
}

export interface ErroPaginaResolvido {
  info: ErrorInfo;
  titulo: string;
  subtitulo: string;
  descricao: string;
  mensagemApi?: string;
  origem: ErrorOrigem;
  returnTo: string;
  retryLabel: string;
  isAuthError: boolean;
  isNotFound: boolean;
  statusCode?: number;
}

export function resolverErroPagina(
  state: ErrorPageState | null | undefined,
  isRotaDesconhecida: boolean
): ErroPaginaResolvido {
  const origem = state?.origem ?? "geral";
  const configOrigem = obterConfigOrigem(origem);
  const statusCode = isRotaDesconhecida ? 404 : state?.statusCode;
  const info = getErrorInfo(statusCode);

  const titulo = isRotaDesconhecida
    ? "Página não encontrada"
    : `${info.title}`;

  const contextoSuffix = isRotaDesconhecida
    ? "O link que você acessou não existe no Sabor da Família."
    : `Isso ocorreu ${configOrigem.contexto}.`;

  const mensagemApi = state?.message?.trim();
  const descricaoPadrao = isRotaDesconhecida
    ? "Use o menu ou volte ao início para continuar navegando."
    : info.description;

  const descricao =
    mensagemApi && mensagemApi !== descricaoPadrao
      ? descricaoPadrao
      : mensagemApi || descricaoPadrao;

  const mensagemDestaque =
    mensagemApi && mensagemApi !== descricaoPadrao ? mensagemApi : undefined;

  return {
    info,
    titulo,
    subtitulo: contextoSuffix,
    descricao,
    mensagemApi: mensagemDestaque,
    origem,
    returnTo: state?.returnTo ?? configOrigem.returnTo,
    retryLabel: configOrigem.retryLabel,
    isAuthError: statusCode === 401 || statusCode === 403,
    isNotFound: statusCode === 404 || isRotaDesconhecida,
    statusCode,
  };
}
