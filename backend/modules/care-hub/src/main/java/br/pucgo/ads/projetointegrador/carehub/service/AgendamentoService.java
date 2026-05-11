package br.pucgo.ads.projetointegrador.carehub.service;

import br.pucgo.ads.projetointegrador.carehub.dto.agendamento.AgendamentoRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.agendamento.AgendamentoResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.agendamento.ContrapropostaRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.entity.Agendamento;
import br.pucgo.ads.projetointegrador.carehub.entity.Cliente;
import br.pucgo.ads.projetointegrador.carehub.entity.Cuidador;
import br.pucgo.ads.projetointegrador.carehub.entity.RegistroAcompanhamento;
import br.pucgo.ads.projetointegrador.carehub.entity.TipoAtendimento;
import br.pucgo.ads.projetointegrador.carehub.exception.OperacaoNaoPermitidaException;
import br.pucgo.ads.projetointegrador.carehub.repository.AgendamentoRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.ClienteRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.CuidadorRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.RegistroAcompanhamentoRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Service de Agendamentos do CareHub.
 *
 * <p><strong>Mudança de arquitetura:</strong> removidos os imports de
 * {@code plataforma.repository.UserRepository} e {@code plataforma.entity.User}.
 * O método {@code getUserIdByUsernameOrEmail} agora consulta o
 * {@link UsuarioRepository} local ({@code care_hub.usuario}).
 */
@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final CuidadorRepository cuidadorRepository;
    private final ClienteRepository clienteRepository;
    private final RegistroAcompanhamentoRepository registroRepository;

    /**
     * Repositório local — substitui o plataforma.repository.UserRepository.
     * Consulta {@code care_hub.usuario} para resolver o ID pelo username/email.
     */
    private final UsuarioRepository usuarioRepository;

    // ── Helper: resolve ID do usuário pelo principal (JWT) ───────────────────

    /**
     * Retorna o ID do usuário local ({@code care_hub.usuario.id}) a partir do
     * username ou email extraído do JWT ({@code principal.getName()}).
     *
     * <p>Todos os services que recebem {@code Principal} usam este método.
     */
    public Long getUserIdByUsernameOrEmail(String usernameOrEmail) {
        return usuarioRepository
                .findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .map(u -> u.getId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + usernameOrEmail));
    }

    // ── Criar agendamento ─────────────────────────────────────────────────────

    @Transactional
    public AgendamentoResponseDTO criarAgendamento(AgendamentoRequestDTO dto) {
        Long cuidadorId = Objects.requireNonNull(dto.getCuidadorId(), "Cuidador ID cannot be null");
        Long clienteId = Objects.requireNonNull(dto.getClienteId(), "Cliente ID cannot be null");

        Cuidador cuidador = cuidadorRepository.findById(cuidadorId)
                .orElseThrow(() -> new RuntimeException("Cuidador não encontrado"));
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        Agendamento agendamento = new Agendamento();
        agendamento.setCuidador(cuidador);
        agendamento.setCliente(cliente);
        agendamento.setDataHoraInicio(dto.getDataHoraInicio());
        agendamento.setDataHoraFim(dto.getDataHoraFim());
        agendamento.setObservacoes(dto.getObservacoes());

        if (dto.getTipoAtendimento() != null && !dto.getTipoAtendimento().isBlank()) {
            try {
                agendamento.setTipoAtendimento(TipoAtendimento.valueOf(dto.getTipoAtendimento().toUpperCase()));
            } catch (IllegalArgumentException e) {
                agendamento.setTipoAtendimento(TipoAtendimento.ACOMPANHAMENTO);
            }
        } else {
            agendamento.setTipoAtendimento(TipoAtendimento.ACOMPANHAMENTO);
        }

        agendamento = agendamentoRepository.save(agendamento);
        return toResponseDTO(agendamento);
    }

    // ── Atualizar status ──────────────────────────────────────────────────────

    @Transactional
    public AgendamentoResponseDTO atualizarStatus(Long id, String status, java.security.Principal principal) {
        Objects.requireNonNull(id, "Agendamento ID cannot be null");
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        if (principal == null) {
            throw new OperacaoNaoPermitidaException("Operação não autorizada: usuário não autenticado");
        }

        Long callerId = getUserIdByUsernameOrEmail(principal.getName());
        Agendamento.StatusAgendamento novoStatus = Agendamento.StatusAgendamento.valueOf(status);

        switch (novoStatus) {
            case EM_ANDAMENTO:
                if (!callerId.equals(agendamento.getCuidador().getId())) {
                    throw new OperacaoNaoPermitidaException("Apenas o cuidador pode iniciar o atendimento");
                }
                validarInicioAtendimento(agendamento);
                criarRegistroAutomatico(agendamento);
                agendamento.setStatus(novoStatus);
                break;

            case CONFIRMADO:
                if (agendamento.getStatus() == Agendamento.StatusAgendamento.REAGENDADO) {
                    if (!callerId.equals(agendamento.getCliente().getId())) {
                        throw new OperacaoNaoPermitidaException("Apenas o cliente pode aceitar a contraproposta");
                    }
                    if (agendamento.getProposedDataHoraInicio() == null || agendamento.getProposedDataHoraFim() == null) {
                        throw new RuntimeException("Não existe contraproposta pendente para este agendamento");
                    }
                    agendamento.setDataHoraInicio(agendamento.getProposedDataHoraInicio());
                    agendamento.setDataHoraFim(agendamento.getProposedDataHoraFim());
                    agendamento.setProposedDataHoraInicio(null);
                    agendamento.setProposedDataHoraFim(null);
                    agendamento.setStatus(Agendamento.StatusAgendamento.CONFIRMADO);
                } else {
                    if (!callerId.equals(agendamento.getCuidador().getId())) {
                        throw new OperacaoNaoPermitidaException("Apenas o cuidador pode confirmar a proposta inicial");
                    }
                    agendamento.setStatus(Agendamento.StatusAgendamento.CONFIRMADO);
                }
                break;

            case REAGENDADO:
                throw new OperacaoNaoPermitidaException("Use o endpoint de contraproposta para propor nova data");

            case CANCELADO:
                if (!callerId.equals(agendamento.getCliente().getId()) &&
                    !callerId.equals(agendamento.getCuidador().getId())) {
                    throw new OperacaoNaoPermitidaException(
                            "Somente o cliente ou o cuidador podem cancelar este agendamento");
                }
                agendamento.setStatus(Agendamento.StatusAgendamento.CANCELADO);
                break;

            case CONCLUIDO:
                if (!callerId.equals(agendamento.getCuidador().getId())) {
                    throw new OperacaoNaoPermitidaException("Apenas o cuidador pode marcar como concluído");
                }
                agendamento.setStatus(Agendamento.StatusAgendamento.CONCLUIDO);
                break;

            case PENDENTE:
            default:
                throw new OperacaoNaoPermitidaException("Transição de status não permitida");
        }

        agendamento = agendamentoRepository.save(agendamento);
        return toResponseDTO(agendamento);
    }

    // ── Contraproposta ────────────────────────────────────────────────────────

    @Transactional
    public AgendamentoResponseDTO proporContraproposta(Long id, ContrapropostaRequestDTO dto,
                                                        java.security.Principal principal) {
        Objects.requireNonNull(id, "Agendamento ID cannot be null");
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        if (principal == null) {
            throw new OperacaoNaoPermitidaException("Operação não autorizada: usuário não autenticado");
        }

        Long callerId = getUserIdByUsernameOrEmail(principal.getName());
        if (!callerId.equals(agendamento.getCuidador().getId())) {
            throw new OperacaoNaoPermitidaException("Apenas o cuidador pode propor uma contraproposta");
        }
        if (dto.getDataHoraFim().isBefore(dto.getDataHoraInicio())) {
            throw new RuntimeException("Data/hora de fim da contraproposta deve ser posterior ao início");
        }
        if (dto.getDataHoraInicio().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("A contraproposta não pode ter início no passado");
        }

        agendamento.setProposedDataHoraInicio(dto.getDataHoraInicio());
        agendamento.setProposedDataHoraFim(dto.getDataHoraFim());
        agendamento.setStatus(Agendamento.StatusAgendamento.REAGENDADO);

        agendamento = agendamentoRepository.save(agendamento);
        return toResponseDTO(agendamento);
    }

    @Transactional
    public AgendamentoResponseDTO aceitarContraproposta(Long id, java.security.Principal principal) {
        Objects.requireNonNull(id, "Agendamento ID cannot be null");
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        if (principal == null) {
            throw new OperacaoNaoPermitidaException("Operação não autorizada: usuário não autenticado");
        }

        Long callerId = getUserIdByUsernameOrEmail(principal.getName());
        if (!callerId.equals(agendamento.getCliente().getId())) {
            throw new OperacaoNaoPermitidaException("Apenas o cliente pode aceitar a contraproposta");
        }
        if (agendamento.getStatus() != Agendamento.StatusAgendamento.REAGENDADO) {
            throw new RuntimeException("Não há contraproposta pendente para este agendamento");
        }
        if (agendamento.getProposedDataHoraInicio() == null || agendamento.getProposedDataHoraFim() == null) {
            throw new RuntimeException("Dados da contraproposta inválidos");
        }

        agendamento.setDataHoraInicio(agendamento.getProposedDataHoraInicio());
        agendamento.setDataHoraFim(agendamento.getProposedDataHoraFim());
        agendamento.setProposedDataHoraInicio(null);
        agendamento.setProposedDataHoraFim(null);
        agendamento.setStatus(Agendamento.StatusAgendamento.CONFIRMADO);

        agendamento = agendamentoRepository.save(agendamento);
        return toResponseDTO(agendamento);
    }

    // ── Consultas ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDTO> listarPorCuidador(Long cuidadorId) {
        return agendamentoRepository.findByCuidadorIdOrderByDataSolicitacaoDesc(cuidadorId)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDTO> listarPorCliente(Long clienteId) {
        return agendamentoRepository.findByClienteIdOrderByDataSolicitacaoDesc(clienteId)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AgendamentoResponseDTO buscarPorId(Long id) {
        if (id == null) throw new IllegalArgumentException("ID do agendamento não pode ser nulo");
        return toResponseDTO(agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado")));
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDTO> listarPorCuidadorEPeriodo(Long cuidadorId,
                                                                    LocalDateTime inicio,
                                                                    LocalDateTime fim) {
        return agendamentoRepository.findByCuidadorAndPeriodo(cuidadorId, inicio, fim)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDTO> listarProximos(Long userId, int dias) {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime limite = agora.plusDays(dias);
        return agendamentoRepository.findProximosAgendamentos(userId, agora, limite)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional
    public void cancelarAgendamento(Long id) {
        Objects.requireNonNull(id, "Agendamento ID cannot be null");
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));
        agendamento.setStatus(Agendamento.StatusAgendamento.CANCELADO);
        agendamentoRepository.save(agendamento);
    }

    @Transactional(readOnly = true)
    public boolean podeEditarProntuario(Long cuidadorId, Long clienteId) {
        Objects.requireNonNull(cuidadorId, "Cuidador ID cannot be null");
        Objects.requireNonNull(clienteId, "Cliente ID cannot be null");
        LocalDateTime inicioHoje = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime fimHoje = inicioHoje.plusDays(1);
        return agendamentoRepository.existsAgendamentoAtivoHoje(cuidadorId, clienteId, inicioHoje, fimHoje);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> verificarPodeIniciar(Long id) {
        Objects.requireNonNull(id, "Agendamento ID cannot be null");
        Map<String, Object> resultado = new HashMap<>();
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime inicioPermitido = agendamento.getDataHoraInicio().minusMinutes(30);
        LocalDateTime fimPermitido = agendamento.getDataHoraFim();
        boolean podeIniciar = !agora.isBefore(inicioPermitido) && !agora.isAfter(fimPermitido);

        resultado.put("podeIniciar", podeIniciar);
        resultado.put("agora", agora.toString());
        resultado.put("inicioPermitido", inicioPermitido.toString());
        resultado.put("fimPermitido", fimPermitido.toString());
        resultado.put("dataHoraInicio", agendamento.getDataHoraInicio().toString());
        resultado.put("motivo", podeIniciar
                ? "Você pode iniciar o atendimento agora."
                : (agora.isBefore(inicioPermitido)
                        ? "Ainda não está no horário. Você poderá iniciar 30 minutos antes."
                        : "O horário agendado já passou."));
        return resultado;
    }

    public List<AgendamentoResponseDTO> listarAvaliacoesPendentes(Long clienteId) {
        Objects.requireNonNull(clienteId, "Cliente ID não pode ser null");
        return agendamentoRepository.findAgendamentosPendentesAvaliacaoByClienteId(clienteId)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public long contarAvaliacoesPendentes(Long clienteId) {
        Objects.requireNonNull(clienteId, "Cliente ID não pode ser null");
        return agendamentoRepository.countAvaliacoesPendentesByClienteId(clienteId);
    }

    public long contarPendentesCuidador(Long cuidadorId) {
        Objects.requireNonNull(cuidadorId, "Cuidador ID não pode ser null");
        return agendamentoRepository.countPendentesByCuidadorId(cuidadorId);
    }

    public long contarReagendadosCliente(Long clienteId) {
        Objects.requireNonNull(clienteId, "Cliente ID não pode ser null");
        return agendamentoRepository.countReagendadosByClienteId(clienteId);
    }

    // ── Helpers privados ──────────────────────────────────────────────────────

    private void validarInicioAtendimento(Agendamento agendamento) {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime inicioPermitido = agendamento.getDataHoraInicio().minusMinutes(30);
        LocalDateTime fimPermitido = agendamento.getDataHoraFim();
        if (agora.isBefore(inicioPermitido)) {
            throw new OperacaoNaoPermitidaException(
                    String.format("Não é possível iniciar o atendimento ainda. Agendado para %s. " +
                                  "Você poderá iniciá-lo a partir de %s (30 min antes).",
                            agendamento.getDataHoraInicio(), inicioPermitido));
        }
        if (agora.isAfter(fimPermitido)) {
            throw new OperacaoNaoPermitidaException(
                    String.format("Não é possível iniciar o atendimento. O horário já passou (término: %s).",
                            fimPermitido));
        }
    }

    private void criarRegistroAutomatico(Agendamento agendamento) {
        boolean jaExiste = registroRepository.existsByAgendamentoId(agendamento.getId());
        if (!jaExiste) {
            RegistroAcompanhamento registro = new RegistroAcompanhamento();
            registro.setAgendamento(agendamento);
            registro.setCuidador(agendamento.getCuidador());
            registro.setCliente(agendamento.getCliente());
            registro.setDataHoraRegistro(LocalDateTime.now());
            registro.setObservacoes("Atendimento iniciado - Aguardando preenchimento pelo cuidador");
            registroRepository.save(registro);
        }
    }

    private AgendamentoResponseDTO toResponseDTO(Agendamento agendamento) {
        AgendamentoResponseDTO dto = new AgendamentoResponseDTO();
        dto.setId(agendamento.getId());
        dto.setCuidadorId(agendamento.getCuidador().getId());
        dto.setCuidadorNome(agendamento.getCuidador().getName());
        dto.setClienteId(agendamento.getCliente().getId());
        dto.setClienteNome(agendamento.getCliente().getName());
        dto.setDataHoraInicio(agendamento.getDataHoraInicio());
        dto.setDataHoraFim(agendamento.getDataHoraFim());
        dto.setStatus(agendamento.getStatus().name());
        dto.setObservacoes(agendamento.getObservacoes());
        if (agendamento.getTipoAtendimento() != null) {
            dto.setTipoAtendimento(agendamento.getTipoAtendimento().name());
        }
        dto.setDataSolicitacao(agendamento.getDataSolicitacao());
        dto.setProposedDataHoraInicio(agendamento.getProposedDataHoraInicio());
        dto.setProposedDataHoraFim(agendamento.getProposedDataHoraFim());
        return dto;
    }
}
