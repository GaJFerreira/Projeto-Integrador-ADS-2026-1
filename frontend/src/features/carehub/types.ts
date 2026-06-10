// DTO types aligned with backend CareHub controllers/DTOs
export interface ClienteResponseDTO {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  necessidades?: string;
  endereco?: string;
  contatoEmergencia?: string;
  tipoCliente?: string;
}

export interface CuidadorResponseDTO {
  id: number;
  platformUserId?: number;
  nome: string;
  email: string;
  telefone: string;
  experiencia?: string;
  especialidades?: string[];
  cidade?: string;
  estado?: string;
  disponibilidade?: boolean;
  avaliacaoMedia?: number;
  totalAvaliacoes?: number;
  biografia?: string;
  fotoPerfil?: string;
  ativo?: boolean;
  criadoEm?: string;
}

export interface CuidadorBuscarParams {
  nome?: string; // Busca por nome do cuidador
  localizacao?: string; // "Cidade-UF"
  especialidade?: string;
  disponibilidade?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number; // current page (0-indexed)
  pageSize: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AgendamentoRequestDTO {
  clienteId: number;
  cuidadorId: number;
  dataHoraInicio: string; // ISO
  dataHoraFim: string; // ISO
  observacoes?: string;
  tipoAtendimento?: string;
}

export interface AgendamentoResponseDTO {
  id: number;
  clienteId: number;
  clienteNome?: string;
  cuidadorId: number;
  cuidadorNome?: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  tipoAtendimento?: string;
  status: string;
  dataSolicitacao?: string;
  observacoes?: string;
}

export interface ProntuarioRequestDTO {
  clienteId: number;
  dataNascimento?: string; // ISO date
  historicoMedico: string;
  medicamentosUso?: string;
  alergias?: string;
  contatoEmergencia?: string;
  observacoesGerais?: string;
  tipoSanguineo?: string; // ex: O+, A-
  necessidadesEspeciais?: string;
}

export interface ProntuarioResponseDTO extends Omit<ProntuarioRequestDTO, 'clienteId'> {
  id: number;
  clienteId: number;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface MensagemRequestDTO {
  destinatarioId: number;
  conteudo: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface MensagemResponseDTO {
  id: number;
  remetenteId: number;
  remetenteTipo?: string;
  destinatarioId: number;
  destinatarioTipo?: string;
  conteudo: string | null;
  lida: boolean;
  dataEnvio: string;
  mediaUrl?: string;
  mediaType?: string;
  enviadaPeloUsuarioLogado?: boolean;
}

export interface AvaliacaoRequestDTO {
  cuidadorId: number;
  agendamentoId: number;
  nota: number; // 1..5
  comentario?: string;
}

export interface AvaliacaoResponseDTO {
  id: number;
  cuidadorId: number;
  nota: number;
  comentario?: string;
  clienteId: number;
  clienteNome?: string;
  cuidadorNome?: string;
  dataAvaliacao: string;
  agendamentoId?: number;
}

export interface DispositivoIoTCreateRequestDTO {
  nome?: string;
  deviceId?: string;
  deviceKey?: string;
}

export interface DispositivoIoTResponseDTO {
  id: number;
  nome: string;
  deviceId: string;
  ativo: boolean;
  ultimoBatimentoEm?: string;
  deviceKeyPlain?: string; // retornado apenas na criação
}

export interface AlertaEmergenciaResponseDTO {
  id: number;
  status: string;
  tipo: string;
  origem: string;
  observacao?: string;
  clienteId: number;
  clienteNome: string;
  dispositivoId: number;
  deviceId: string;
  dispositivoNome: string;
  criadoEm: string;
  reconhecidoEm?: string;
}
