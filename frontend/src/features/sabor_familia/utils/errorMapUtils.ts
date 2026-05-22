import type { ErrorInfo } from "../dto/error/ErrorInfo";

export const ERROR_MAP: Record<number, ErrorInfo> = {
  400: { title: 'Requisição inválida',          description: 'Os dados enviados não puderam ser processados. Verifique as informações e tente novamente.', icon: 'warning'   },
  401: { title: 'Não autorizado',               description: 'Você precisa estar autenticado para acessar este recurso. Faça login e tente novamente.',    icon: 'lock'      },
  403: { title: 'Acesso negado',                description: 'Você não tem permissão para acessar esta página ou recurso.',                                icon: 'lock'      },
  404: { title: 'Página não encontrada',        description: 'O endereço que você tentou acessar não existe ou foi removido.',                             icon: 'not-found' },
  408: { title: 'Tempo esgotado',               description: 'A requisição demorou muito para ser concluída. Verifique sua conexão e tente novamente.',    icon: 'warning'   },
  422: { title: 'Dados não processáveis',       description: 'As informações enviadas contêm erros de validação. Revise e tente novamente.',               icon: 'warning'   },
  429: { title: 'Muitas requisições',           description: 'Você excedeu o limite de tentativas. Aguarde alguns instantes antes de tentar novamente.',   icon: 'warning'   },
  500: { title: 'Erro interno do servidor',     description: 'Algo deu errado do nosso lado. Nossa equipe foi notificada e estamos trabalhando na correção.', icon: 'server' },
  501: { title: 'Não implementado',             description: 'Esta funcionalidade ainda não está disponível. Tente novamente mais tarde.',                 icon: 'server'    },
  502: { title: 'Gateway inválido',             description: 'Recebemos uma resposta inválida do servidor. Tente novamente em alguns instantes.',          icon: 'server'    },
  503: { title: 'Serviço indisponível',         description: 'O serviço está temporariamente fora do ar, possivelmente em manutenção. Tente mais tarde.',  icon: 'server'    },
};

export const FALLBACK_ERROR: ErrorInfo = {
  title: 'Algo deu errado',
  description: 'Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.',
  icon: 'generic',
};

export function getErrorInfo(statusCode?: number): ErrorInfo {
  if (!statusCode) return FALLBACK_ERROR;
  return ERROR_MAP[statusCode] ?? FALLBACK_ERROR;
}
